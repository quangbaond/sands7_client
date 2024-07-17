<script setup>
import { getStorage } from '@/common'
import { onMounted, watch } from 'vue'
import { formatCurrency } from '../common';
import iconDeposit from '@/assets/images/icons/profile/deposit.svg'
import { CaretRightOutlined, HomeOutlined } from '@ant-design/icons-vue';
import { ref, reactive } from 'vue';
import axios from '@/common/axios.js';
import { useRouter } from 'vue-router';
import { banks } from '../common/constants';
import { layer } from '@layui/layer-vue';


const user = ref(getStorage('user'))
const staticUrl = import.meta.env.VITE_APP_STATIC_URL ?? 'http://localhost:3000'
const formattedBalanceUser = ref(formatCurrency(user.balance))
const formattedBetTodayUser = ref(formatCurrency(user.betToday))
const router = useRouter();
const formState = reactive({
    bankAccountNumber: '',
    bankName: '',
    bankBranch: '',
    bankAccountName: ''
});
onMounted(() => {
    // console.log(user)
    axios.get('/me/profile').then((res) => {
        user.value = res.user;
        formState.bankAccountNumber = res.user.bankAccountNumber;
        formState.bankName = res.user.bankName;
        formState.bankBranch = res.user.bankBranch;
        formState.bankAccountName = res.user.bankAccountName;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
})
watch(user, (newVal) => {
    formattedBalanceUser.value = formatCurrency(newVal.balance);
    formattedBetTodayUser.value = formatCurrency(newVal.betToday);
})

const onFinish = values => {
    console.log('Success:', values);
    axios.post('/me/link-bank', values).then((res) => {
        layer.msg('Liên kết tài khoản ngân hàng thành công', {
            icon: 1,
            time: 2000
        });
    }).catch((err) => {
        layer.msg('Liên kết thất bại', {
            icon: 2,
            time: 2000
        });
    });
};
const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
    layer.msg('Vui lòng nhập đầy đủ thông tin', {
        icon: 2,
        time: 2000
    });
};
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
            <!-- liên kết tài khoản ngân hàng -->
            <a-row gutter="10" style="text-align: center; justify-content: center;" v-if="!user.bankAccountNumber">
                <a-col :span="12">
                    <a-space direction="vertical">
                        <h3 style="color: #fff">Liên kết ngân hàng</h3>
                    </a-space>
                </a-col>
            </a-row>
            <a-form layout="vertical" :model="formState" autocomplete="off" @finish="onFinish"
                @finishFailed="onFinishFailed">
                <a-form-item label="CHọn ngân hàng" name="bankName"
                    :rules="[{ required: true, message: 'Vui lòng chọn ngân hàng' }]">
                    <a-select v-model:value="formState.bankName">
                        <a-select-option :value="bank.short_name" v-for="bank in banks" :key="bank.short_name">
                            {{ `(${bank.short_name}) ${bank.name}` }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="Chi nhánh" name="bankBranch"
                    :rules="[{ required: true, message: 'Vui lòng nhập chi nhánh' }]">
                    <a-input v-model:value="formState.bankBranch"></a-input>
                </a-form-item>
                <a-form-item label="Số tài khoản" name="bankAccountNumber"
                    :rules="[{ required: true, message: 'Vui lòng nhập số tài khoản' }]">
                    <a-input v-model:value="formState.bankAccountNumber"></a-input>
                </a-form-item>
                <a-form-item label="Tên tài khoản" name="bankAccountName"
                    :rules="[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]">
                    <a-input v-model:value="formState.bankAccountName"></a-input>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" style="width: 100%;" html-type="submit">Liên kết</a-button>
                </a-form-item>
            </a-form>
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