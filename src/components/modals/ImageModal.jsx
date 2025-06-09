import React, { useState, useRef } from 'react';
import {
  Dialog,
  IconButton,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ImageModal = ({ open, onClose, images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const swiperRef = useRef(null);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          color: 'white',
          zIndex: 2,
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        <Swiper
          modules={[Navigation, Pagination, Keyboard, Mousewheel]}
          initialSlide={currentImageIndex}
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ clickable: true }}
          keyboard
          mousewheel
          spaceBetween={50}
          slidesPerView={1}
          style={{
            width: '100%',
            height: '100%',
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
            '--swiper-pagination-bottom': '24px',
            '--swiper-pagination-bullet-size': '0px',
            '--swiper-pagination-bullet-horizontal-gap': '6px',
          }}
        >
          {images.map((image, index) => {
            const imageUrl = typeof image === 'string'
              ? `${import.meta.env.VITE_API_URL}/uploads/${image}`
              : URL.createObjectURL(image.file);

            return (
              <SwiperSlide key={index}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  position: 'relative',
                }}>
                  <img
                    src={imageUrl}
                    alt={`Property image ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      cursor: 'zoom-in',
                      transform: zoomedIndex === index ? 'scale(2)' : 'scale(1)',
                      transition: 'transform 0.3s ease',
                    }}
                    onClick={() => setZoomedIndex(zoomedIndex === index ? null : index)}
                  />
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <IconButton
          className="swiper-button-prev"
          sx={{
            position: 'fixed',
            left: 16,
            top: '50%',
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
          }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>

        <IconButton
          className="swiper-button-next"
          sx={{
            position: 'fixed',
            right: 16,
            top: '50%',
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
          }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <Box sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}>
            {images.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: currentImageIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ImageModal; 