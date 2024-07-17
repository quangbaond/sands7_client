<script setup>
import { getStorage } from '@/common'
import { onMounted, watch } from 'vue'
import { formatCurrency } from '../common';
import iconDeposit from '@/assets/images/icons/profile/deposit.svg'
import { CaretRightOutlined, HomeOutlined } from '@ant-design/icons-vue';
import { ref, reactive } from 'vue';
import axios from '@/common/axios.js';
import { useRouter } from 'vue-router';
import { layer } from '@layui/layer-vue';
const user = ref(getStorage('user'))
const staticUrl = import.meta.env.VITE_APP_STATIC_URL ?? 'http://localhost:3000'
const formattedBalanceUser = ref(formatCurrency(user.balance))
const formattedBetTodayUser = ref(formatCurrency(user.betToday))
const router = useRouter();
const formState = reactive({
    amount: '',
    reson: ''
});
onMounted(() => {
    // console.log(user)
    axios.get('/me/profile').then((res) => {
        user.value = res.user;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
})
watch(user, (newVal) => {
    formattedBalanceUser.value = formatCurrency(newVal.balance);
    formattedBetTodayUser.value = formatCurrency(newVal.betToday);
})
const changeInput = (e) => {
    formState.amount = e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
const onFinish = values => {
    values.amount = Number(values.amount.replace(/\D/g, ""));
    values.type = 'withdraw';
    console.log(values.amount, user.value.balance);

    if (values.amount > user.value.balance) {
        layer.msg('Số dư không đủ', {
            icon: 2,
            time: 2000
        });
        return;
    }
    axios.post('/me/withdraw', values).then((res) => {
        layer.msg('Yêu cầu rút tiền thành công.', {
            icon: 1,
            time: 4000
        });
        if (res.user) {
            user.value = res.user;
        }
    }).catch((err) => {
        layer.msg('Rút tiền thất bại', {
            icon: 2,
            time: 2000
        });
    });
};
const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
    layer.msg('Vui lòng nhập số tiền', {
        icon: 2,
        time: 2000
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
            </a-row>
        </div>
        <div class="deposit" style="margin: 20px;">
            <h3 style="color: #fff;">Rút tiền về tài khoản</h3>
            <!-- liên kết tài khoản ngân hàng -->
            <a-row gutter="10" style="text-align: center; justify-content: center;" v-if="!user.bankAccountNumber">
                <a-col :span="12">
                    <a-space direction="vertical">
                        <router-link to="/link-bank">Bạn vui lòng liên kết ngân hàng.</router-link>
                    </a-space>
                </a-col>
            </a-row>
            <a-row gutter="10" style="text-align: center; justify-content: center">
                <a-col :span="24">
                    <a-form layout="vertical" :model="formState" autocomplete="off" @finish="onFinish"
                        @finishFailed="onFinishFailed">
                        <a-form-item label="Số tiền rút" name="amount" :rules="[
                            { required: true, message: 'Vui lòng nhập số tiền' },
                            { pattern: /^[0-9]+$/, message: 'Số tiền không hợp lệ' }
                        ]">
                            <a-input-number @change="changeInput" v-model:value="formState.amount" />
                        </a-form-item>
                        <a-form-item label="Ghi chú" name="reson">
                            <a-textarea v-model:value="formState.reson" />
                        </a-form-item>
                        <a-form-item>
                            <a-button style="width:100%" type="primary" html-type="submit">Rút tiền</a-button>
                        </a-form-item>
                    </a-form>
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

label {
    color: #fff !important;
}
</style>