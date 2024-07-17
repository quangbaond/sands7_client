<script setup>
import { ref, defineProps } from 'vue';
// const selectedKeys = ref(['2']);
const props = defineProps(['selectedKeys'])



</script>
<template>
    <a-layout-header>
        <div class="logo" />
        <a-menu v-model:selectedKeys="props.selectedKeys" theme="dark" mode="horizontal"
            :style="{ lineHeight: '64px' }">
            <a-menu-item key="1">
                <router-link to="/admin">Người dùng</router-link>
            </a-menu-item>
            <a-menu-item key="2">
                <router-link to="/admin/game">Game</router-link>
            </a-menu-item>
            <a-menu-item key="3">
                <router-link to="/admin/profile">Đổi mật khẩu</router-link>
            </a-menu-item>
            <a-menu-item key="4">
                <router-link to="/admin/setting">Cài đặt</router-link>
            </a-menu-item>
            <a-menu-item key="5">
                <router-link to="/admin/request-money">Quản lý nạp rút</router-link>
            </a-menu-item>
        </a-menu>
    </a-layout-header>
</template>