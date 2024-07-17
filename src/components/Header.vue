<script setup>
import GoogleTranslateSelect from '@google-translate-select/vue3';
import Logo from '@/assets/images/logo.png';
const handleGoogleTranslateSelect = (language) => {
    console.log(language)
}
</script>

<template>
    <a-row gutter="10" style="display: flex; justify-content: space-between; margin: 0 10px;">
        <a-col :span="12">
            <img :src="Logo" alt="" style="max-width: 100%; width: 150px;">

        </a-col>
        <a-col :span="12"
            style="display: flex; align-self: center;color: #fff; text-align: right; justify-content: end;">
            <GoogleTranslateSelect default-language-code="vi" default-page-language-code="vi"
                :fetch-browser-language="true" trigger="click" @select="handleGoogleTranslateSelect" />
        </a-col>
    </a-row>

</template>