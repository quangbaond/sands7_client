<script setup>
import { HomeOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { getStorage, formatCurrency } from '../common';
import { onMounted, ref, watch } from 'vue';
import { ReloadOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import iconCoin10k from '@/assets/images/icons/games/coin/10k.png'
import iconCoin100k from '@/assets/images/icons/games/coin/100k.png'
import iconCoin1m from '@/assets/images/icons/games/coin/1m.png'
import iconCoin50k from '@/assets/images/icons/games/coin/50k.png'
import iconCoinAll from '@/assets/images/icons/games/coin/all.png'
import { socket } from "@/socket";
import { layer } from "@layui/layer-vue";
import axios from '@/common/axios';
import moment from 'moment';
const betDataOnServer = ref(null)
const user = ref(getStorage('user'))
const formattedBalanceUser = ref(formatCurrency(user.value.balance))
const router = useRouter()

const codeInParam = router.currentRoute.value.params.code
const setting = ref({
    value: '1.98'
})
console.log(codeInParam);
onMounted(() => {
    axios.get('/me/profile').then((res) => {
        user.value = res.user;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
    axios.get('/setting').then((res) => {
        setting.value = res;
    });
    socket.on('connected', (data) => {
        console.log('connected', data);
    })
    socket.on(codeInParam, async (dataBet) => {
        betDataOnServer.value = dataBet
    })

    socket.on(`win-${user.value._id}-${codeInParam}`, (data) => {
        changeBalance(data.prize, '+')
        layer.msg('Chúc mừng bạn đã trúng cược, ' + '+' + formatCurrency(data.prize), {
            icon: 1,
            time: 1000,
        });
    })

    socket.on(`lose-${user.value._id}-${codeInParam}`, (data) => {
        layer.msg('Chúc bạn may mắn lần sau', {
            icon: 2,
            time: 1000,
        });
    })

    socket.on(`betDataResponse-${user.value._id}`, (data) => {
        console.log(data);
        // user.value.balance = data.balance
        changeBalance(data.balance, '-')
        layer.msg('Đặt cược thành công', {
            icon: 1,
            time: 1000,
        });
    })
})

const amount = ref(0)
const formatNumber = () => {
    amount.value = amount.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const betData = ref([0, 1, 2, 3, 4])
const resetBet = () => {
    betInUser.value = []
    amount.value = ''
}

const changeBalance = (amount, calculation = '+') => {
    // tạo hiệu ứng thay đổi số dư
    user.value.balance = calculation === '+' ? user.value.balance = amount : user.value.balance = amount
    formattedBalanceUser.value = formatCurrency(user.value.balance)

}
const visible = ref(false);
const showModal = () => {
    visible.value = true;
};
const handleOk = e => {
    console.log(e);
    visible.value = false;
};

// hiệu ứng hiển thị kết quả khi đang quay quả bóng
const wheelResult = ref(null)
const showResult = (on = true) => {
    if (on) {
        wheelResult.value = setInterval(() => {
            betData.value.map((item, index) => {
                betData.value[index] = Math.floor(Math.random() * 9)
            })
        }, 100)
    } else {
        clearInterval(wheelResult.value)
    }
}

const betInUser = ref([])
// watch amout change
// watch(() => amount.value, (value) => {

// })
watch(() => betDataOnServer.value, (value) => {
    if (value) {
        if (value.timeRemain === '00:00:00') {
            showResult(true)
            setTimeout(() => {
                showResult(false)
                betData.value = value.betData
                betInUser.value = []
                amount.value = ''
            }, 6000)
        }
    }
})

watch(() => user.value, (value) => {
    formattedBalanceUser.value = formatCurrency(value.balance)
})

const onBetItem = (id, value) => {
    if (betInUser.value.findIndex(item => item.id === id && item.value === value) > -1) {
        const index = betInUser.value.findIndex(item => item.id === id && item.value === value)
        betInUser.value.splice(index, 1)
    } else {
        betInUser.value.push({ id, value })
    }
}
const onAmount = (value) => {
    if (value === 'all') {
        amount.value = user.value.balance
    } else {
        amount.value += value
    }
}

const onBet = () => {
    if (betInUser.value.length === 0) {
        layer.msg('Vui lòng chọn cược', {
            icon: 2,
            time: 1000,
        });
        return
    }
    if (amount.value === '') {
        layer.msg('Vui lòng nhập số lượng cược', {
            icon: 2,
            time: 1000,
        });
        return
    }

    if (amount.value * betInUser.value.length > user.value.balance) {
        layer.msg('Số dư không đủ', {
            icon: 2,
            time: 1000,
        });
        return
    }
    const data = {
        betInUser: betInUser.value,
        betDataID: betDataOnServer.value._id,
        amount: amount.value * betInUser.value.length,
        userID: user.value._id,
        code: codeInParam,
        username: user.value.username
    }
    socket.emit('onBet', data);
    // changeBalance(parseInt(amount.value.replace(/\D/g, '')) * betInUser.value.length, '-')

}
const historyBet = ref([])
const getHistoryBet = (type) => {
    axios.get(`/history/get/${type}`).then((res) => {
        historyBet.value = res.docs
    }).catch((err) => {
        console.log(err);
    })
}
watch(() => visible.value, (value) => {
    if (value) {
        getHistoryBet(codeInParam)
    }
})

</script>

<template>
    <div id="game">
        <div class="header">
            <a-space align="center" style="display: flex; justify-content: space-between;">
                <HomeOutlined style="color: #fff; font-size: 25px; display: block;" @click="router.push('/')" />

                <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                    Số dư: {{ formattedBalanceUser }}
                </a-typography-text>
                <!-- <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                    Nhiều màu
                </a-typography-text> -->
            </a-space>
        </div>
        <div class="result_wrap sticky">
            <a-row>
                <a-col :span="11">
                    <a-typography-text
                        style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                        Kết quả mở thưởng
                    </a-typography-text>
                    <a-row span="10" style="justify-content: center;">
                        <a-col :span="6">
                            <a-typography-text class="result_item"
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                {{ betData[0] }}
                            </a-typography-text>
                        </a-col>
                        <a-col :span="6">
                            <a-typography-text class="result_item"
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                {{ betData[1] }}
                            </a-typography-text>
                        </a-col>
                        <a-col :span="6">
                            <a-typography-text class="result_item"
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                {{ betData[2] }}
                            </a-typography-text>
                        </a-col>
                        <a-col :span="6">
                            <a-typography-text class="result_item"
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                {{ betData[3] }}
                            </a-typography-text>
                        </a-col>
                        <a-col :span="6">
                            <a-typography-text class="result_item"
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                {{ betData[4] }}
                            </a-typography-text>
                        </a-col>
                    </a-row>
                </a-col>
                <a-col :span="11">
                    <a-typography-text
                        style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                        Phiên id
                    </a-typography-text>
                    <a-typography-text
                        style="color: #ccc; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                        {{ betDataOnServer ? betDataOnServer.id : '' }}
                    </a-typography-text>
                    <a-typography-text
                        style="color: #0d8ea7; font-size: 18px; display: block; font-weight: 600; text-align: center;">
                        <span>{{ betDataOnServer && betDataOnServer?.timeRemain !== '00:00:00' ?
                            betDataOnServer.timeRemain : 'Ngừng cược' }}</span>
                    </a-typography-text>
                </a-col>
                <a-col :span="2">
                    <ReloadOutlined style="color: #fff; font-size: 20px; font-weight: 900; cursor: pointer;" />
                </a-col>
            </a-row>
            <div
                style="text-align: center; width: 25px; margin: auto; background-color: #0f1d30; height: 25px; display: flex; justify-content: center;">
                <ArrowDownOutlined style="color: #fff; font-size: 15px; font-weight: 900; align-self: center;"
                    @click="showModal" />
            </div>
        </div>


        <div class="bet_wrap">
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Quả bóng đầu tiên
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 0 && item.value === 1) > -1 }"
                            @click="onBetItem(0, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                {{ codeInParam === 'sx5d' ? setting.value : '1.98' }}
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 0 && item.value === 2) > -1 }"
                            @click="onBetItem(0, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                {{ codeInParam === 'sx5d' ? setting.value : '1.98' }}
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 0 && item.value === 3) > -1 }"
                            @click="onBetItem(0, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 0 && item.value === 4) > -1 }"
                            @click="onBetItem(0, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Quả bóng thứ 2
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 1 && item.value === 1) > -1 }"
                            @click="onBetItem(1, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 1 && item.value === 2) > -1 }"
                            @click="onBetItem(1, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 1 && item.value === 3) > -1 }"
                            @click="onBetItem(1, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 1 && item.value === 4) > -1 }"
                            @click="onBetItem(1, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Quả bóng thứ 3
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 2 && item.value === 1) > -1 }"
                            @click="onBetItem(2, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 2 && item.value === 2) > -1 }"
                            @click="onBetItem(2, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 2 && item.value === 3) > -1 }"
                            @click="onBetItem(2, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 2 && item.value === 4) > -1 }"
                            @click="onBetItem(2, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Quả bóng thứ 4
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 3 && item.value === 1) > -1 }"
                            @click="onBetItem(3, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 3 && item.value === 2) > -1 }"
                            @click="onBetItem(3, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 3 && item.value === 3) > -1 }"
                            @click="onBetItem(3, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 3 && item.value === 4) > -1 }"
                            @click="onBetItem(3, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Quả bóng thứ 5
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 4 && item.value === 1) > -1 }"
                            @click="onBetItem(4, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 4 && item.value === 2) > -1 }"
                            @click="onBetItem(4, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 4 && item.value === 3) > -1 }"
                            @click="onBetItem(4, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 4 && item.value === 4) > -1 }"
                            @click="onBetItem(4, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
            <div class="bet">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    Tổng
                </a-typography-text>
                <a-row :gutter="10">
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 5 && item.value === 1) > -1 }"
                            @click="onBetItem(5, 1)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Lớn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 5 && item.value === 2) > -1 }"
                            @click="onBetItem(5, 2)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Nhỏ
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 5 && item.value === 3) > -1 }"
                            @click="onBetItem(5, 3)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đơn
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                    <a-col :span="6">
                        <a-card
                            :class="{ 'onBet': betInUser.findIndex(item => item.id === 5 && item.value === 4) > -1 }"
                            @click="onBetItem(5, 4)">
                            <a-typography-text
                                style="color: #fff; font-size: 16px; display: block; text-align: center;">
                                Đôi
                            </a-typography-text>
                            <a-typography-text
                                style="color: #ccc; font-size: 14px; display: block; text-align: center;">
                                1.98
                            </a-typography-text>
                        </a-card>
                    </a-col>
                </a-row>
            </div>
        </div>

        <div class="onbet">
            <a-row gutter="10" style="justify-content: space-around;">
                <a-col :span="12" style=" display: flex;">
                    <a-input-number v-model:value="amount" placeholder="Nhập số lượng" @change="formatNumber"
                        style="width: 100%;" />
                </a-col>
                <a-col :span="12" style=" display: flex; justify-content: space-around;">
                    <div style="display: flex;">
                        <div class="coin_item" style="position: relative;">
                            <img :src="iconCoin10k" alt="" style="max-width: 30px">
                            <div @click="onAmount(10)" style="position: absolute; top: 23% ;left: 20%;">10</div>
                        </div>
                        <div class="coin_item" style="position: relative;">
                            <img :src="iconCoin50k" alt="" style="max-width: 30px">
                            <div @click="onAmount(50)" style="position: absolute; top: 23% ;left: 20%;">50</div>
                        </div>
                        <div class="coin_item" style="position: relative;">
                            <img :src="iconCoin100k" alt="" style="max-width: 30px">
                            <div @click="onAmount(100)" style="position: absolute; top: 23% ;left: 10%;">100</div>
                        </div>
                        <div class="coin_item" style="position: relative;">
                            <img :src="iconCoin1m" alt="" style="max-width: 30px">
                            <div @click="onAmount(1000)" style="position: absolute; top: 23% ;left: 20%;">1k</div>
                        </div>
                        <div class="coin_item" style="position: relative;">
                            <img :src="iconCoinAll" alt="" style="max-width: 30px">
                            <div @click="onAmount('all')" style="position: absolute; top: 23% ;left: 20%;">All</div>
                        </div>
                    </div>

                </a-col>
                <a-col :span="12" style="margin-top: 10px;">
                    <a-row gutter="10">
                        <a-col :span="12">
                            <a-button @click="resetBet" style="width: 100%">Xóa</a-button>
                        </a-col>
                        <a-col :span="12">
                            <a-button type="primary" @click="onBet" style="width: 100%">Đặt cược</a-button>
                        </a-col>
                    </a-row>
                </a-col>
            </a-row>
        </div>
    </div>
    <a-modal v-model:visible="visible" title="Lịch sử phiên" :footer="null" centered>
        <a-row style="margin-bottom: 10px;">
            <a-col :span="8">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                    ID
                </a-typography-text>
            </a-col>
            <a-col :span="8">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                    Số giả thưởng
                </a-typography-text>
            </a-col>
            <a-col :span="8">
                <a-typography-text
                    style="color: #fff; font-size: 16px; display: block; font-weight: 600; text-align: center;">
                    Thời gian
                </a-typography-text>
            </a-col>
        </a-row>
        <a-row guuter="10" v-for="bet in historyBet" :key="bet._id" style="margin-bottom: 10px;">
            <a-col :span="8">
                <a-typography-text
                    style="color: #fff; font-size: 13px; display: block; font-weight: 600; text-align: center;">
                    {{ bet.betData.id }}
                </a-typography-text>
            </a-col>
            <a-col :span="8">
                <a-row gutter="15" style="justify-content: center;">
                    <a-col :span="4" v-for="betN in bet.betData.betData" :key="betN">
                        <a-typography-text class="result_item2"
                            style="color: #fff; font-size: 13px; display: block; text-align: center;">
                            {{ betN }}
                        </a-typography-text>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="8">
                <a-typography-text
                    style="color: #fff; font-size: 13px; display: block; font-weight: 600; text-align: center;">
                    {{ moment(bet.betData.timeEnd).format('H:mm:ss') }}
                </a-typography-text>
            </a-col>
        </a-row>
    </a-modal>
</template>

<style>
#game {
    background-color: #0C192C;
    min-height: 100vh;
}

.bet_wrap {
    margin: 20px 0;
    margin-bottom: 90px;
}

.coin_item {
    cursor: pointer;
}

.result_item {
    width: 30px;
    height: 30px;
    background-image: linear-gradient(179deg, #13a2ba, #087c95);
    margin: 5px;
    border-radius: 100%;
}

.result_item2 {
    width: 20px;
    height: 20px;
    background-image: linear-gradient(179deg, #13a2ba, #087c95);
    /* margin: 5px; */
    border-radius: 100%;
}

.onBet {
    background-image: linear-gradient(179deg, #13a2ba, #087c95);
    border: 1px solid #13a2ba;
}

.header {
    padding: 10px;
}

.counter {
    color: #fff;
    font-size: 14px;
    display: block;
}

.result_wrap,
.bet {
    padding: 10px;
    background-color: #0f1d30;
    min-height: 100px;
    margin: 10px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0;
}

.ant-modal-content,
.ant-modal-header {
    background-color: #0f1d30 !important;
    color: #fff !important;
}

.sticky {
    position: -webkit-sticky
        /* Safari */
    ;
    position: sticky !important;
    top: 0;
}

.ant-card {
    background-color: #404b5e;
    border: 1px solid #404b5e;
}

.ant-card-body {
    padding: 10px !important;
    cursor: pointer;
}

.onbet {
    background-color: #0f1d30;
    /* margin: 10px; */
    padding: 10px;
    /* border-radius: 15px; */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0;
    bottom: 0;
    max-width: 576px;
    width: -webkit-fill-available;
    position: fixed;
}

/* background-color: rgb(19, 34, 53);
padding: 25px 10px;
text-align: center;
position: fixed; */


#coin10k {
    background-image: url(@/assets/images/icons/games/coin/10k.png);
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    text-align: center;
    padding: 10px;
    cursor: pointer;
}

.ant-modal-title,
.ant-modal-close-x {
    color: #fff !important;
}
</style>