import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonIcon,
  IonPage,
  IonRow,
  IonSearchbar,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonGrid,
  IonRouterLink
} from '@ionic/react';
import './Board.css';
import { arrowDown, arrowUp, chatbox, chatbubble, location, thumbsDown, thumbsUp } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

import { animalsJson } from "../../hardcoded/Grid_Animals/StaticElements";
import AppHeader from '../../components/Header/AppHeader';

const Board: React.FC = () => {
  const itemsPerPage = 4; // cuántos mostrar por carga
  const [searchText, setSearchText] = useState('');
  const [visibleAnimals, setVisibleAnimals] = useState(
    animalsJson.slice(0, itemsPerPage)
  );

  // Filtrar resultados según búsqueda
  const filteredAnimals = animalsJson.filter((animal) => {
    if (!searchText) return true;
    const text = searchText.toLowerCase();
    return (
      animal.name?.toLowerCase().includes(text) ||
      animal.description?.toLowerCase().includes(text) ||
      animal.last_seen_place?.toLowerCase().includes(text) ||
      (animal.keywords &&
        animal.keywords.some((kw) => kw.toLowerCase().includes(text)))
    );
  });

  // Infinite scroll: cargar más resultados filtrados
  const loadMore = async (ev: CustomEvent<void>) => {
    const nextIndex = visibleAnimals.length;
    const newItems = filteredAnimals.slice(nextIndex, nextIndex + itemsPerPage);

    setVisibleAnimals([...visibleAnimals, ...newItems]);

    (ev.target as HTMLIonInfiniteScrollElement).complete();
  };

  // Reset visibleAnimals cuando cambia el filtro
  useEffect(() => {
    setVisibleAnimals(filteredAnimals.slice(0, itemsPerPage));
  }, [searchText]);

  return (
    <IonPage className="blank_page">
      <AppHeader />

      <IonContent  fullscreen>
        <IonRow className="select-location ion-align-items-center brown-element" >
          <IonCol  size="10">
            <span style={{ fontSize: 12 }} className="edit-label">
              Torreón, Coahuila , México
            </span>
          </IonCol>
          <IonCol size="2" className="ion-text-end">
            <IonButton fill="clear" size="small">
              <IonIcon style={{ color: '#ffffffff' }} icon={location} />
            </IonButton>
          </IonCol>
        </IonRow>

        <div className="carousel-wrapper">
          <h2 style={{ color: 'var(--color-primary)', padding: '10px' }} className="carousel-title">
            Mascotas Encontradas
          </h2>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            loop={true}
            autoplay={{ delay: 1000 }}
            pagination={{ clickable: true }}
          >
            <SwiperSlide>
              <img src="/assets/images/static_resources_testing/cat.jpg" alt="Slide 1" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/assets/images/static_resources_testing/cat_2.jpg" alt="Slide 2" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/assets/images/static_resources_testing/cat_3.jpg" alt="Slide 3" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/assets/images/static_resources_testing/cat_4.jpeg" alt="Slide 4" />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Searchbar */}
        <IonRow>
          <IonCol size="12">
            <IonSearchbar
         className='searchBar'
          animated={true}
          // color="primary"
          placeholder="Buscar por rasgo, ejemplo: Lunar en el ojo, mancha blanca, etc"
          value={searchText}
          onIonInput={(e: any) => setSearchText(e.detail.value)}
        />
            </IonCol>
        </IonRow>

        {/* Grid de mascotas */}
        <div className="cards-grid">
          {visibleAnimals.length > 0 ? (
            visibleAnimals.map((animal, idx: number) => (
                <IonRouterLink key={idx} routerLink={`/tabs/pets/${animal.id}`}>
              <IonCard className="card-pets" key={animal.name ?? idx}>
                <div
                  className="card-image-wrapper"
                  style={{
                    backgroundImage: `url(${animal.photo ?? "/assets/images/static_resources_testing/cat.jpg"})`
                  }}
                >
                  <img
                    className="card-image-sizer"
                    src={animal.photo ?? "/assets/images/static_resources_testing/cat.jpg"}
                    alt=""
                    aria-hidden="true"
                  />
                </div>

                <IonCardHeader>
                  <IonCardTitle className="title_name_pet_card">{animal.name}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText className="description_pet_card">{animal.description}</IonText>
                </IonCardContent>

                <IonCardContent>
                  <IonRow>
                    <IonIcon size="small" style={{ color: '#46b1ff ' }} icon={location} />
                    <IonText style={{ fontWeight: 'bold' }}>Ultimo Lugar Visto :</IonText>
                  </IonRow>
                  <IonRow>
                    <IonText>{animal.last_seen_place}</IonText>
                  </IonRow>
                </IonCardContent>
              
                <IonCardContent className="keywords-row">
                  {animal.keywords &&
                    animal.keywords.map((kw, kidx) => (
                      <IonButton
                        key={kidx}
                        fill="clear"
                        className="keyword-chip"
                        onClick={() => setSearchText(kw)} // ✅ filtra al hacer clic en keyword
                        aria-label={`Filtrar por ${kw}`}
                      >
                        <i className="fa-solid fa-hashtag" aria-hidden="true" />
                        <span style={{ fontSize: 10 }} className="keyword-text">
                          {kw}
                        </span>
                      </IonButton>
                    ))}
                   
                </IonCardContent>
                  <IonCardContent>
                   

                      
                       <IonGrid style={{borderTop:'1px solid #cccccc',paddingTop:'10px',paddingBottom:'0px',marginTop:'10px'}}>
                        <IonRow>

                          {/* [Premium Feature] This will be a premium feature in future versions */}
                            <IonCol  size='6'>
                                {/* <IonButton fill="clear" size='small' >
                               <IonIcon style={{ color: '#46b1ff ' }}  icon={arrowUp} />

                                </IonButton>

                                  <IonButton fill="clear" size='small' >
                               <IonIcon style={{ color: '#46b1ff ' }}  icon={arrowDown} />
                                    
                                </IonButton> */}

                            </IonCol>
                            <IonCol  style={{display:'flex',justifyContent:'right',alignItems:'center',textAlign:'center'}} size='6'>
                                 <IonIcon style={{ color: '#46b1ff ' }} size='micro'  icon={chatbubble} />
                                 <IonText >
                                <span style={{ color: '#46b1ff ',fontSize:10 }} >46</span>
                            </IonText>
                            </IonCol>
                        
                       </IonRow>
                       </IonGrid>

                </IonCardContent>
              </IonCard>
              </IonRouterLink>
            ))
          ) : (
            <IonText color="medium" className="ion-text-center" style={{ marginTop: '20px' }}>
              No se encontraron resultados
            </IonText>
          )}
        </div>

        {/* Infinite Scroll */}
        {visibleAnimals.length > 0 && (
          <IonInfiniteScroll
            onIonInfinite={loadMore}
            threshold="100px"
            disabled={visibleAnimals.length >= filteredAnimals.length}
          >
            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Cargando más mascotas..."
            />
          </IonInfiniteScroll>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Board;
