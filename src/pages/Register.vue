<script setup>
import { reactive, ref, onMounted, inject } from 'vue';
import axios from '@/common/axios';
import { layer } from "@layui/layer-vue";
import { setStorage } from '@/common';
import { useRouter } from 'vue-router'

const formState = reactive({
    inviteCode: '',
    username: '',
    password: '',
    passwordConfirm: '',
    password2: '',
    agreeToTerms: true,
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
    axios.post('/auth/register', values).then((res) => {
        layer.msg("Đăng ký thành công", { icon: 1, time: 5000 });
        setTimeout(() => {
            if (res.token) {
                setStorage('token', res.token);
                setStorage('user', res.user);
                router.push('/');
            }
        }, 2000);
    }).catch((err) => {
        console.log(err);
        if (err.response.status === 422 || err.response.status === 500) {
            layer.msg(err.response.data.message, {
                icon: 2,
                time: 5000,
            });
        } else {
            layer.msg('Đã có lỗi xảy ra, vui lòng thử lại sau', {
                icon: 2,
                time: 5000,
            });
        }
        return false;
    }).finally(() => {
        loadingBtn.value = false;
        disbaledBtn.value = false;
        layer.close(layerLoad);
    });
};

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
};
// how to use $device



onMounted(() => {
    console.log('mounted');
    axios.get('/config/get-invite-code').then((res) => {
        inviteCodeAdmin.value = res.inviteCode;
    });
});
</script>

<template>
    <div id="login_wrap">
        <div id="login">
            <a-form :model="formState" name="basic" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed"
                style="width: 100%">
                <a-typography-text class="ant-form-text" type="" style="padding-bottom: 10px;">
                    Nếu không có mã đề nghị, vui lòng nhập: {{ inviteCodeAdmin }}
                </a-typography-text>
                <a-form-item name="inviteCode" :rules="[{ required: true, message: 'Vui lòng nhập mã mời' }]">
                    <a-input v-model:value="formState.inviteCode" size="large" placeholder="Mã mời" />
                </a-form-item>
                <a-form-item name="username" :rules="[{ required: true, message: 'Tên đăng nhập không được để trống' },
                { min: 6, message: 'Tên đăng nhập phải có ít nhất 6 ký tự' },
                { max: 20, message: 'Tên đăng nhập không được quá 20 ký tự' },
                { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên đăng nhập chỉ chứa ký tự và số' }]">
                    <a-input v-model:value="formState.username" size="large" placeholder="Tên đăng nhập" />
                </a-form-item>
                <!-- // password -->
                <a-form-item name="password" :rules="[{ required: true, message: 'Mật khẩu không được để trống' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                ]">
                    <a-input-password v-model:value="formState.password" size="large" placeholder="Mật khẩu"
                        autocomplete="new-password" />
                </a-form-item>
                <!-- // confirm password -->
                <a-form-item name="passwordConfirm" :rules="[{ required: true, message: 'Vui lòng xác nhận mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                {
                    validator: (rule, value, callback) => {
                        console.log(value, formState.password);

                        if (value !== formState.password) {
                            callback('Mật khẩu không khớp');
                        }
                        else { callback(); }
                    }
                },
                ]">
                    <a-input-password v-model:value="formState.passwordConfirm" size="large"
                        placeholder="Xác nhận mật khẩu" />
                </a-form-item>
                <!-- // password2 -->
                <a-form-item name="password2" :rules="[{ required: true, message: 'Mật khẩu rút tiền không được để trống' },
                { min: 6, message: 'Mật khẩu rút tiền phải có ít nhất 6 ký' },
                ]">
                    <a-input-password v-model:value="formState.password2" size="large"
                        placeholder="Mật khẩu rút tiền" />
                </a-form-item>
                <router-link to="/login">Đăng nhập với tài khoản đã có</router-link>

                <a-form-item name="agreeToTerms" :valuePropName="formState.agreeToTerms"
                    :rules="[{ required: true, message: 'Vui lòng đồng ý với điều khoản' }]">
                    <a-checkbox v-model:checked="formState.agreeToTerms">
                        Tôi đồng ý với <router-link href="#">điều khoản </router-link> của trang web này
                    </a-checkbox>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit" style="width: 100%">
                        Đăng ký
                    </a-button>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>

<style>
#login_wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
    background-image: url(@/assets/images/bg_register.jpg);
    background-size: cover;
    background-position: center;
    width: 100%;
}

#login {
    min-width: 400px;
    min-height: 300px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    padding: 20px;
    /* justify-content: center; */
    /* align-items: center; */
}
</style>