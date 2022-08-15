<template>
  <div class="thumb-example">
    <swiper
      @slideChangeTransitionStart="onSwiperSlideChangeTransitionStart"
      class="swiper gallery-thumbs"
      :options="swiperOptionThumbs"
      ref="swiperThumbs"
    >
      <swiper-slide class="slide-1" v-for="item in swiperSlides" :key="item">
        <img :src="`http://placekitten.com/1000/${item}00`" alt="" />
      </swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
      <div class="swiper-button-next swiper-button-black" slot="button-next"></div>
      <div class="swiper-button-prev swiper-button-black" slot="button-prev"></div>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

export default {
  name: 'MySwiper',

  components: {
    Swiper,
    SwiperSlide,
  },

  data() {
    return {
      swiperOptionThumbs: {
        loop: true,
        loopedSlides: 5, // looped slides should be the same
        spaceBetween: 10,
        centeredSlides: true,
        slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: true,
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction',
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      },

      swiperSlides: [1, 2, 3, 4, 5],
    }
  },
  computed: {
    swiper() {
      return this.$refs.swiperThumbs.$swiper
    },
  },

  methods: {
    onSwiperSlideChangeTransitionStart() {
      console.log(this.swiper.activeIndex, this.swiper.realIndex)
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.swiper.slideTo(3, 1000, false)
    })
  },
}
</script>

<style lang="scss">
.thumb-example {
  height: 200px;
  width: 1000px;
  // background: #eee;
}

.swiper {
  .swiper-slide {
    background-size: cover;
    background-position: center;
  }

  &.gallery-top {
    height: 80%;
    width: 100%;
  }
  &.gallery-thumbs {
    box-sizing: border-box;
  }
  &.gallery-thumbs .swiper-slide {
    width: 25%;
    height: 200px;
    opacity: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 200px;
      max-height: 200px;
    }
  }
  &.gallery-thumbs .swiper-slide-active {
    opacity: 1;
    border: 1px solid #ccc;
  }
}
</style>
