<script setup>
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import slider1 from '@/assets/images/slider/1.jpg'
import slider2 from '@/assets/images/slider/2.jpg'
import slider3 from '@/assets/images/slider/3.jpg'
import slider4 from '@/assets/images/slider/4.jpg'
import iconDeposit from '@/assets/images/icons/deposit.png'
import iconWithdraw from '@/assets/images/icons/withdraw.png'
import iconAccount from '@/assets/images/icons/account.png'

import sliderFooter from '@/assets/images/slider/5.png'
import iconHome from '@/assets/images/icons/home.png'
import iconLottery from '@/assets/images/icons/lottery.svg'
import iconHistoryBet from '@/assets/images/icons/historyBet.png'
import iconCSKH from '@/assets/images/icons/cskh.svg'
import iconProfile from '@/assets/images/icons/profile.png'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/common/axios'
import { layer } from "@layui/layer-vue"

import { getStorage, formatCurrency, baotri, cskh } from '@/common'
import { listGame } from '../common/constants'
import Header from '../components/Header.vue'
const slider = [
    {
        id: 1,
        title: 'Slide 1',
        description: 'Description 1',
        image: slider1
    },
    {
        id: 2,
        title: 'Slide 2',
        description: 'Description 2',
        image: slider2
    },
    {
        id: 3,
        title: 'Slide 3',
        description: 'Description 3',
        image: slider3
    },
    {
        id: 4,
        title: 'Slide 4',
        description: 'Description 4',
        image: slider4
    },
];

const user = ref(getStorage('user'));
const formattedBalanceUser = ref(formatCurrency(user.balance));

onMounted(() => {
    console.log(user.value);
    axios.get('/me/profile').then((res) => {
        user.value = res.user;
    }).catch((err) => {
        console.log(err);
        router.push('/login');
    });
});
watch(user, (newVal) => {
    console.log(newVal);
    formattedBalanceUser.value = formatCurrency(newVal.balance);
});

const router = useRouter();

</script>

<template>
    <div class="home">
        <Header />

        <div class="slider">
            <carousel :items-to-show="1" :autoplay="1500" :wrap-around="true">
                <slide v-for="slide in slider" :key="slide">
                    <div class="carousel__item">
                        <img :src="slide.image" style="max-width: 100%;" />
                    </div>
                </slide>

                <template #addons>
                    <navigation />
                    <pagination />
                </template>
            </carousel>
        </div>
        <div class="main">
            <div class="navigation">
                <a-space align="start" style="justify-content: space-between;display: flex;">
                    <a-space direction="vertical">
                        <a-typography-text>
                            Chào mừng, {{ user.username }}
                        </a-typography-text>
                        <a-typography-text>
                            Số dư, <span style="color: #fff; font-size: 20px;">{{ formattedBalanceUser }}</span>
                        </a-typography-text>
                    </a-space>
                    <a-space align="center" size="large">
                        <a-space align="center" direction="vertical">
                            <img :src="iconDeposit" alt="" style="width: 30px">
                            <a-typography-text style="display: block; text-align: center; font-size: 10px;">
                                Nạp tiền
                            </a-typography-text>
                        </a-space>
                        <a-space align="center" direction="vertical" @click="router.push('/withdraw')">
                            <img :src="iconWithdraw" alt="" style="width: 30px">
                            <a-typography-text style="display: block; text-align: center; font-size: 10px;">
                                Rút tiền
                            </a-typography-text>
                        </a-space>
                        <a-space align="center" direction="vertical" @click="router.push('/profile')">
                            <img :src="iconAccount" alt="" style="width: 30px">
                            <a-typography-text style="display: block; text-align: center; font-size: 10px;">
                                Tài khoản
                            </a-typography-text>
                        </a-space>
                        <!-- <a-space align="center" direction="vertical">
                            <router-link to="/admin" v-if="user.role === 'admin'">Admin</router-link>
                        </a-space> -->

                    </a-space>
                </a-space>
            </div>
            <div class="list_game" style="margin-top: 10px;">
                <a-space :size="[0, 0]" style="width: 100%;" class="list_game_item" wrap>
                    <div class="bg_game" v-for="game in listGame" :key="game.code"
                        @click="router.push(`/game/${game.code}`)">
                        <a-typography-text style="color: #fff; font-size: 14px; display: block; height: 30px;">
                            {{ game.type }}
                        </a-typography-text>
                        <a-typography-text style="color: #fff; font-size: 10px; display: block; height: 30px;">
                            {{ game.name }}
                        </a-typography-text>
                        <img :src="game.image" alt="" style="width: 50px;">
                    </div>

                </a-space>
            </div>

            <div class="slider-footer">
                <img :src="sliderFooter" alt="" style="max-width: 100%;">
            </div>
        </div>
        <div class="footer">
            <a-space align="center" style="justify-content: space-between; display: flex; cursor: pointer;">
                <a-space direction="vertical" @click="router.push('/')">
                    <img :src="iconHome" alt="" style="width: 20px;">
                    <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                        Trang chủ
                    </a-typography-text>
                </a-space>
                <a-space direction="vertical" @click="router.push('/profile/historybet')" style="cursor: pointer;">
                    <img :src="iconHistoryBet" alt="" style="width: 20px;">
                    <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                        Lịch sử cược
                    </a-typography-text>
                </a-space>
                <a-space direction="vertical" @click="baotri">
                    <img :src="iconLottery" alt="" style="max-width: 20px;">
                    <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                        Sảnh xổ số
                    </a-typography-text>
                </a-space>
                <a-space direction="vertical" @click="cskh">
                    <img :src="iconCSKH" alt="" style="max-width: 20px;">
                    <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                        CSKH
                    </a-typography-text>
                </a-space>
                <a-space direction="vertical" @click="router.push('/profile')" style="cursor: pointer;">
                    <img :src="iconProfile" alt="" style="max-width: 20px;">
                    <a-typography-text style="color: #fff; font-size: 14px; display: block;">
                        Tôi
                    </a-typography-text>
                </a-space>
            </a-space>
        </div>
    </div>
</template>

<style>
.footer {
    background-color: rgb(19, 34, 53);
    padding: 15px 10px;
    text-align: center;
    /* position: fixed; */
    bottom: 0;
    max-width: 576px;
    width: -webkit-fill-available;
    position: fixed;

}

.home {
    background-color: #0C192C;
    min-height: 100vh;
}

.slider-footer {
    margin: 20px 0;
    margin-bottom: 100px;
}

.main {
    padding: 10px;
    margin-top: 15px;
}

.list_game_item .ant-space-item {
    width: 25%;
    min-height: 100px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

}

.bg_game {
    min-height: 100px;
    background-image: url(@/assets/images/icons/games/bg.png);
    background-size: cover;
    background-position: center;
    width: 100%;
    text-align: center;
    padding: 10px;
    cursor: pointer;
}

.bg_game:hover {
    opacity: 0.5;
}

.carousel__item {
    min-height: 200px;
    width: 100%;
    background-color: var(--vc-clr-primary);
    color: var(--vc-clr-white);
    font-size: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel__slide {
    padding: 10px;
}

.carousel__prev,
.carousel__next {
    box-sizing: content-box;
    color: #ffff
}

.carousel__pagination-button::after {
    background-color: white;
}

.carousel__viewport {
    max-height: 240px;
}
</style>