<script setup>
import { reactive, ref, onMounted, inject } from 'vue';
import axios from '@/common/axios';
import { layer } from "@layui/layer-vue";
import { setStorage } from '@/common';
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import Header from '../components/Header.vue';
import Logo from '@/assets/images/logo.png';
import { cskh } from '../common';

const formState = reactive({
    username: '',
    password: '',
});
const inviteCodeAdmin = ref('');
const router = useRouter();
const loadingBtn = ref(false);
const disbaledBtn = ref(false);

const onFinish = async (values) => {
    if (loadingBtn.value) return;
    loadingBtn.value = true;
    disbaledBtn.value = true;
    const layerLoad = layer.load(1);
    axios.post('/auth/login', values).then((res) => {
        layer.msg("Đăng nhập thành công", { icon: 1, time: 5000 });
        setTimeout(() => {
            if (res.token) {
                setStorage('token', res.token);
                setStorage('user', res.user);
                router.push('/');
            }
        }, 2000);
    }).catch((err) => {
        console.log(err);
        layer.msg(err.response.data.message, {
            icon: 2,
            time: 5000,
        });

        return false;
    }).finally(() => {
        loadingBtn.value = false;
        disbaledBtn.value = false;
        layer.close(layerLoad);
    });
};

const onFinishFailed = (errorInfo) => {
    layer.msg('Vui lòng điền đầy đủ thông tin', {
        icon: 2,
        time: 3000,
    });
};

onMounted(() => {

});
</script>

<template>
    <!-- <Header /> -->
    <div id="wrap">
        <div>
            <Header />
        </div>

        <a-row justify="center" align="middle" style="height: calc(100vh - 60px);">
            <a-col :span="20">
                <a-form :model="formState" name="basic" autocomplete="off" @finish="onFinish"
                    @finishFailed="onFinishFailed" style="width: 100%">
                    <img :src="Logo" alt="" style="max-width: 100%;">

                    <a-form-item name="username" :rules="[{ required: true, message: 'Tên đăng nhập không được để trống' },
                    { min: 6, message: 'Tên đăng nhập phải có ít nhất 6 ký tự' },
                    { max: 20, message: 'Tên đăng nhập không được quá 20 ký tự' },
                    { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên đăng nhập chỉ chứa ký tự và số' }]">
                        <a-input v-model:value="formState.username" size="large" placeholder="Tên đăng nhập">
                            <template #prefix>
                                <user-outlined />
                            </template>
                        </a-input>
                    </a-form-item>
                    <a-form-item name="password" :rules="[
                        { required: true, message: 'Mật khẩu không được để trống' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                    ]">
                        <a-input-password v-model:value="formState.password" size="large" placeholder="Mật khẩu"
                            autocomplete="new-password">
                            <template #prefix>
                                <LockOutlined />
                            </template>
                        </a-input-password>
                    </a-form-item>
                    <a-form-item>
                        <a-button :loading="loadingBtn" :disabled="disbaledBtn" type="primary" html-type="submit"
                            style="width: 100%" size="large">
                            Đăng nhập
                        </a-button>
                    </a-form-item>
                   <a-space align="center">
                    <a-button type="link" class="link" @click="router.push('/register')">Đăng ký</a-button>
                    <a-button type="link" class="link" @click="router.push('/register')">CSKH</a-button>
                    <a-button type="link" class="link" @click="cskh">Quên mật
                        khẩu</a-button>
                </a-space>
                </a-form>
            </a-col>
        </a-row>
    </div>

</template>

<style>


#wrap {
    height: 100vh;
    background-image: url(@/assets/images/bg_login.PNG);
    background-size: cover;
    background-position: center;
}
.link {
    color: #aaa9a9;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
}
</style>