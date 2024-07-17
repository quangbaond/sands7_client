<script setup>
import { getStorage } from '@/common'
import { onMounted, watch } from 'vue'
import { formatCurrency, cskh } from '../common';
import iconDeposit from '@/assets/images/icons/profile/deposit.svg'
import { CaretRightOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import axios from '@/common/axios.js';
import { useRouter } from 'vue-router';
import { layer } from '@layui/layer-vue';

const user = ref(getStorage('user'))
const router = useRouter();
const staticUrl = import.meta.env.VITE_APP_STATIC_URL ?? 'http://localhost:3000'
const formattedBalanceUser = ref(formatCurrency(user.balance))
const formattedBetTodayUser = ref(formatCurrency(user.betToday))
const formattedWinTodayUser = ref(formatCurrency(user.balance))
const totalOnbet = ref({
    totalOnbet: 0,
    totalWin: 0
});
onMounted(() => {
    // console.log(user)
    axios.get('/me/profile').then((res) => {
        user.value = res.user;
        totalOnbet.value = res.totalOnbet || {
            totalOnbet: 0,
            totalWin: 0
        };
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
})
watch(user, (newVal) => {
    formattedBalanceUser.value = formatCurrency(newVal.balance);
    // formattedBetTodayUser.value = formatCurrency(newVal.totalOnbet.totalOnbet);
})
watch(totalOnbet, (newVal) => {
    console.log(newVal);
    formattedBetTodayUser.value = formatCurrency(newVal.totalOnbet);
    formattedWinTodayUser.value = formatCurrency(newVal.totalWin);
})
const logout = () => {
    axios.post('/auth/logout').then((res) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        layer.msg('Đăng xuất thành công', {
            icon: 1,
            time: 2000
        });
        router.push('/login');
    }).catch((err) => {
        console.log(err);
    });
}
</script>

<template>
    <div id="profile">
        <div class="info">
            <a-space align="center" style="display: flex; justify-content: space-around;">
                <HomeOutlined style="color: #fff; font-size: 25px; display: block;" @click="router.push('/')" />
                <a-avatar :size="64" :src="staticUrl + user.avatar" :alt="user.username"></a-avatar>
                <a-typography.Title style="color: #fff; font-size: 18px;">{{ user.username
                    }}</a-typography.Title>
            </a-space>
        </div>

        <div class="info_description">
            <a-row gutter="5" style="text-align: center; justify-content: center;">
                <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Số dư tài khoản
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 16px;">
                            {{ formattedBalanceUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col>
                <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Đặt cược hôm nay
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 16px;">
                            {{ formattedBetTodayUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col>
                <a-col :span="8">
                    <a-space direction="vertical">
                        <a-typography.Title level="5" style="color: #5d636e; display: block; height: 30px;">
                            Lãi và lỗ hôm nay
                        </a-typography.Title>
                        <a-typography.Title level="5" style="color: #fff; font-size: 16px;">
                            {{ formattedWinTodayUser }}
                        </a-typography.Title>
                    </a-space>
                </a-col>
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

        <div class="navigation">
            <a-row gutter="20">
                <!-- <a-col :span="24">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                            <a-typography.Text style="color: #fff; font-size: 20px;">
                                Lịch sử giao dịch
                            </a-typography.Text>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px;" />
                        </a-col>
                    </a-row>
                </a-col> -->
                <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <router-link to="/profile/transaction?type=deposit" style="display: flex;">
                                <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                                <a-typography.Text style="color: #fff; font-size: 16px;">
                                    Lịch sử nạp
                                </a-typography.Text>
                            </router-link>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                </a-col>
                <!-- <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                            <a-typography.Text style="color: #fff; font-size: 20px;">
                                Lịch sử rút tiền
                            </a-typography.Text>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                </a-col> -->
                <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <router-link to="/profile/transaction?type=withdraw" style="display: flex;">
                                <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                                <a-typography.Text style="color: #fff; font-size: 16px;">
                                    Lịch sử rút
                                </a-typography.Text>
                            </router-link>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                </a-col>
                <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <router-link to="/profile/historybet" style="display: flex;">
                                <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                                <a-typography.Text style="color: #fff; font-size: 16px;">
                                    Lịch sử đặt cược
                                </a-typography.Text>
                            </router-link>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                </a-col>
                <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <router-link to="/profile/info" style="display: flex;">
                                <img :src="iconDeposit" alt="" style="width: 40px; padding-right: 10px;">
                                <a-typography.Text style="color: #fff; font-size: 16px;">
                                    Trung tâm cá nhân
                                </a-typography.Text>
                            </router-link>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                    <!-- // logout -->


                </a-col>
                <!-- // logout -->
                <a-col :span="24" style="margin-top: 20px;">
                    <a-row style="justify-content: space-around;">
                        <a-col :span="12" style="display: flex;">
                            <a @click="logout" style="display: flex;">
                                <LogoutOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                                <a-typography.Text style="color: #fff; font-size: 16px; padding-left: 15px">
                                    Đăng xuất
                                </a-typography.Text>
                            </a>
                        </a-col>
                        <a-col :span="12" style="text-align: right;">
                            <CaretRightOutlined style="color: #fff; font-size: 23px; font-weight: bold;" />
                        </a-col>
                    </a-row>
                </a-col>
            </a-row>
        </div>

    </div>
</template>

<style>
.navigation {
    padding: 15px;
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