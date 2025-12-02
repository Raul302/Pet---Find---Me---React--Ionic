import React, { useState, useEffect, useContext } from 'react';
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
import { useHistory } from 'react-router-dom';
import './Board.css';
import { arrowDown, arrowUp, chatbox, chatbubble, location, thumbsDown, thumbsUp } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

// data now comes from API
// import AppHeader from '../../components/Header/AppHeader';
import api, { api_endpoint } from '../../config/api';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';
import ModalLocation from '../../components/Modal/ModalLocation';

const Board: React.FC = () => {
  const itemsPerPage = 4; // cuántos mostrar por carga
  const [searchText, setSearchText] = useState('');
  const [visibleAnimals, setVisibleAnimals] = useState<any[]>([]);
  const { pets, fetchPets, loadingPets, petsError, user, setSelectedPet } = useContext(AuthContext) as any;
  const history = useHistory();
  const [address_user,set_addres_user] = useState<any>(null);
  // Data source comes from API (pets). If not loaded yet, treat as empty array.
  const dataSource = pets || [];

  const [modal_place, set_modal_place] = useState<boolean>(false);

  const openModalPlace = () => {
    set_modal_place(true);
  }

  // Filtrar resultados según búsqueda
  const filteredAnimals = dataSource.filter((animal: any) => {
    if (!searchText) return true;
    const text = searchText.toLowerCase();
    return (
      (animal.name && animal.name.toLowerCase().includes(text)) ||
      (animal.description && animal.description.toLowerCase().includes(text)) ||
      (animal.last_seen_place && animal.last_seen_place.toLowerCase().includes(text)) ||
      (animal.keywords && animal.keywords.some((kw: string) => kw.toLowerCase().includes(text)))
    );
  });

  // Infinite scroll: cargar más resultados filtrados
  const loadMore = async (ev: CustomEvent<void>) => {
    const nextIndex = visibleAnimals.length;
    const newItems = filteredAnimals.slice(nextIndex, nextIndex + itemsPerPage);

    setVisibleAnimals([...visibleAnimals, ...newItems]);

    (ev.target as HTMLIonInfiniteScrollElement).complete();
  };

  // Reset visibleAnimals cuando cambia el filtro o los datos vienen del servidor
  useEffect(() => {
    setVisibleAnimals(filteredAnimals.slice(0, itemsPerPage));
  }, [searchText, pets]);

  // Fetch pets from API on mount using context fetchPets
  useEffect(() => {
    (async () => {
      try {
        const json = await fetchPets?.();
        if (json && Array.isArray(json.pets) && json.pets.length > 0) {
          set_addres_user(json.userAddress || 'Todo el mundo');
        } else {
          set_addres_user(null);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);



  const handleCloseModal = () => {
  fetchPets?.();
  set_modal_place(false);
};


  return (
    <IonPage className="blank_page">
      {/* <AppHeader /> */}

      <ModalLocation   onClose={handleCloseModal}  isOpen={modal_place} onDidDismiss={() => set_modal_place(false)} />

      <IonContent fullscreen>
        <IonRow style={{marginTop:'60px', backgroundColor:'var(--color-primary)'}}  
        
        onClick={() => openModalPlace()} 

        className="select-location ion-align-items-center brown-element" >
          <IonCol size="10">
            <span style={{ fontSize: 12 }} className="edit-label">
              {user?.address_preference === 'not_address' ? 'Todo el mundo' : (user?.address_preference || 'Todo el mundo')}
            </span>
          </IonCol>
          <IonCol size="2" className="ion-text-end">
            <IonButton fill="clear" size="small">
              <IonIcon style={{ color: '#ffffffff' }} icon={location} />
              <IonText style={{ color: '#ffffffff' }}  > 5km </IonText>
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
              style={{backgroundColor:'var(--color-primary)'}}
              // color="primary"
              placeholder="Buscar por rasgo, ejemplo: Lunar en el ojo, mancha blanca, etc"
              value={searchText}
              onIonInput={(e: any) => setSearchText(e.detail.value)}
            />
          </IonCol>
        </IonRow>

        {/* Grid de mascotas */}
        {loadingPets && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <IonText>Cargando mascotas...</IonText>
          </div>
        )}
        {petsError && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <IonText color="danger">Error cargando mascotas: {petsError}</IonText>
          </div>
        )}
        <div className="cards-grid">


          {visibleAnimals.length > 0 ? (
            visibleAnimals.map((animal, idx: number) => (
              <div key={idx} style={{ textDecoration: 'none', cursor: 'pointer' }} onClick={() => { setSelectedPet?.(animal); history.push(`/tabs/pets/${animal.id}`); }}>
                <IonCard className="card-pets" key={animal.name ?? idx}>
                  {/* Image carousel: show up to 3 images from animal.photos, fallback to legacy or static */}
                  {(() => {
                    const fallback = "/assets/images/static_resources_testing/cat.jpg";
                    const photosArr: any[] = Array.isArray(animal.photos) ? animal.photos : [];
                    const imageUrls: string[] = [];
                    for (let i = 0; i < Math.min(3, photosArr.length); i++) {
                      const p = photosArr[i];
                      if (!p) continue;
                      const u = p.url || (p.images && p.images[0] && p.images[0].url) || null;
                      if (u) imageUrls.push(u);
                    }
                    if (imageUrls.length === 0) {
                      if (animal.photo) imageUrls.push(animal.photo);
                      else imageUrls.push(fallback);
                    }

                    return (
                      <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        pagination={true}
                        loop={imageUrls.length > 1}
                        // autoplay={imageUrls.length > 1 ? { delay: 3000 } : false}
                        className="swiper-custom "
                      >
                        {imageUrls.map((imgUrl, i) => (
                          <SwiperSlide key={i}>
                            {/* div container of image */}
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              // backgroundColor:'red'
                            }}>
                              <img
                                src={imgUrl}
                                alt={animal.name || ''}
                                aria-hidden="true"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '12px',
                                  boxShadow: '0 3px 3px rgba(0,0,0,0.3)'
                                }}
                              />

                            </div>

                          </SwiperSlide>
                        ))}
                      </Swiper>
                    );
                  })()}

                  <IonCardHeader>
                    <IonCardTitle className="title_name_pet_card">{animal.name}</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonText className="description_pet_card">{animal.description}</IonText>
                  </IonCardContent>

                  <IonCardContent>
                    <IonRow>
                      <IonIcon size="small" style={{ color: 'var(--color-primary)' }} icon={location} />
                      <IonText style={{ fontWeight: 'bold' }}>Ultimo Lugar Visto :</IonText>
                    </IonRow>
                    <IonRow>
                      <IonText>{animal.address}</IonText>
                    </IonRow>
                  </IonCardContent>

                  <IonCardContent className="keywords-row">
                    {animal.keywords &&
                      animal.keywords.map((kw: any, kidx: number) => (
                          <IonButton
                          key={kidx}
                          fill="clear"
                          className="keyword-chip"
                          onClick={() => setSearchText(kw.toString())}
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



                    <IonGrid style={{ borderTop: '1px solid #cccccc', paddingTop: '10px', paddingBottom: '0px', marginTop: '10px' }}>
                      <IonRow>

                        {/* [Premium Feature] This will be a premium feature in future versions */}
                        <IonCol size='6'>
                          {/* <IonButton fill="clear" size='small' >
                               <IonIcon style={{ color: '#46b1ff ' }}  icon={arrowUp} />

                                </IonButton>

                                  <IonButton fill="clear" size='small' >
                               <IonIcon style={{ color: '#46b1ff ' }}  icon={arrowDown} />
                                    
                                </IonButton> */}

                        </IonCol>
                        <IonCol style={{ display: 'flex', justifyContent: 'right', alignItems: 'center', textAlign: 'center' }} size='6'>
                          {/* <IonIcon style={{ color: '#46b1ff ' }} size='micro' icon={chatbubble} />
                          <IonText >
                            <span style={{ color: '#46b1ff ', fontSize: 10 }} >46</span>
                          </IonText> */}
                        </IonCol>

                      </IonRow>
                    </IonGrid>

                  </IonCardContent>
                </IonCard>
                </div>
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
