<script setup>
import { getStorage } from '@/common'
import { onMounted, watch } from 'vue'
import { formatCurrency, cskh } from '../common';
import iconDeposit from '@/assets/images/icons/profile/deposit.svg'
import { CaretRightOutlined, HomeOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import axios from '@/common/axios.js';
import { useRouter } from 'vue-router';

const user = ref(getStorage('user'))
const staticUrl = import.meta.env.VITE_APP_STATIC_URL ?? 'http://localhost:3000'
const formattedBalanceUser = ref(formatCurrency(user.balance))
const formattedBetTodayUser = ref(formatCurrency(user.betToday))
const balanceFluctuations = ref([]);
// get type in router
const router = useRouter();
const type = router.currentRoute.value.query.type;
console.log(type);

onMounted(() => {
    // console.log(user)
    axios.get(`/me/profile`).then((res) => {
        user.value = res.user;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
    axios.get(`/me/get-balance-fluctuation`, {
        params: {
            type: type
        }
    }).then((res) => {
        balanceFluctuations.value = res.docs;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
})
watch(user, (newVal) => {
    formattedBalanceUser.value = formatCurrency(newVal.balance);
    formattedBetTodayUser.value = formatCurrency(newVal.betToday);
})

// watch(balanceFluctuations, (newVal) => {
//     console.log(newVal);
//     formattedBalanceUser.value = formatCurrency(newVal.amount);
// })
</script>

<template>
    <div id="profile">
        <div class="info">
            <a-space align="center" style="display: flex; justify-content: space-around;">
                <HomeOutlined style="color: #fff; font-size: 25px; display: block;" @click="router.push('/')" />

                <a-avatar :size="64" :src="staticUrl + user.avatar" :alt="user.username"></a-avatar>
                <a-typography.Title style="color: #fff; font-size: 18px;"> {{ user.username
                    }}</a-typography.Title>
            </a-space>
        </div>

        <div class="info_description">
            <a-row gutter="10" style="text-align: center; justify-content: center;">
                <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Số dư tài khoản
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 20px;">
                            {{ formattedBalanceUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col>
                <!-- <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Đặt cược hôm nay
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 20px;">
                            {{ formattedBalanceUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col>
                <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Lãi và lỗ hôm nay
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 20px;">
                            {{ formattedBalanceUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col> -->
            </a-row>
        </div>

        <div class="action_money">
            <a-space style="width: 100%; display: flex; justify-content: space-around;">
                <a-button type="primary" @click="cskh">
                    <a-space>
                        <img :src="iconDeposit" alt=""></img>
                        <span>Nạp tiền</span>
                    </a-space>
                </a-button>
                <a-button class="width_draw" @click="router.push('/withdraw')">
                    <a-space>
                        <img :src="iconDeposit" alt=""></img>
                        <span>Rút tiền</span>
                    </a-space>
                </a-button>
            </a-space>
        </div>

        <a-divider style="height: 1px; background-color: #ccc; margin: 0 10px"></a-divider>

        <div class="transaction">
            <h3 style="color: #ccc;">Biến động số dư</h3>

            <div class="transaction_box" v-for="balance in balanceFluctuations" :key="balance._id"
                v-if="balanceFluctuations.length">
                <a-space direction="vertical">
                    <a-typography.Title style="font-size: 16px;">
                        <span style="color: white;">Số dư: </span><span style="color: green;"
                            v-if="balance.type === 'deposit'">+ {{
                            formatCurrency(balance.amount) }}</span>
                        <span style="color: red;" v-else >- {{
                            formatCurrency(balance.amount) }}</span>
                    </a-typography.Title>
                    <a-typography.Title style="color: #fff; display: block; height: 30px;font-size: 16px;">
                        Lý do: {{ balance.reson ?? 'Không có lý do' }}
                    </a-typography.Title>

                    <div style="color: #fff; display: block; height: 30px;font-size: 16px;">
                        Trạng thái: {{ balance.status === 'pending' ? 'Đang chờ xử lý' : balance.status === 'accept' ?
                        'Thành công'
                        : 'Từ chối'}}
                    </div>
                    <div style="color: #fff; display: block; height: 30px;font-size: 16px;" v-if="balance.note">
                        Ghi chú: {{ balance.note }}
                    </div>
                </a-space>
            </div>
            <div v-else>
                <a-typography.Title
                    style="color: #fff; display: block; height: 30px;font-size: 18px; text-align: center;">
                    Không có dữ liệu
                </a-typography.Title>
            </div>
        </div>
    </div>
</template>

<style>
.transaction {
    padding: 15px;
}

.transaction_box {
    padding: 10px;
    background-color: #0f1d30;
    min-height: 100px;
    margin: 10px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0;
}

.action_money {
    padding: 10px;
    background-color: #0f1d30;
    margin: 10px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

#profile {
    background-color: #0C192C;
    min-height: 100vh;
}

.width_draw {
    width: 100%;
    background-image: linear-gradient(124deg, #efdaaf, #dbb579);
}

.info_description {
    padding: 10px;
    background-color: #0f1d30;
    min-height: 100px;
    margin: 10px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0;
}

.info {
    padding-top: 20px;
    padding-left: 20px;
}
</style>