import React from 'react';
export const Swiper = ({ children, ...props }: any) => React.createElement('div', props, children);
export const SwiperSlide = ({ children, ...props }: any) => React.createElement('div', props, children);
export default { Swiper, SwiperSlide };
