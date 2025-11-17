import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonHeader, IonIcon, IonPage, IonRow, IonSearchbar, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './Board.css';
import { card, cash, create, createOutline, heart, location, notificationsOutline, pencil, pencilOutline, personCircleOutline } from 'ionicons/icons';

// Settings to carrrousel - Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';


// Static Examples

import { animalsJson } from "../../hardcoded/Grid_Animals/StaticElements";
import AppHeader from '../../components/Header/AppHeader';


const Board: React.FC = () => {

    return (
        <IonPage className='blank_page'>

          <AppHeader />


            <IonContent fullscreen>
                            <IonRow className="select-location ion-align-items-center">
                <IonCol size="10">
                    <span style={{fontSize:12}} className="edit-label">Torreon, Coahuila , Mexico</span>
                </IonCol>
                <IonCol size="2" className="ion-text-end">
                    <IonButton fill="clear" size="small">
                        <IonIcon  style={{color:'#ffffffff'}} icon={create} />
                    </IonButton>
                </IonCol>
                </IonRow>

                <div className='carousel-wrapper'>
                        <h2  style={{ color:'#4ca5f8',padding:'10px'}} className="carousel-title">Mascotas Encontradas</h2>
                    <Swiper
                    // style={{padding:'50px'}}
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
                            <img src="/assets/images/static_resources_testing/cat_2.jpg" alt="Slide 1" />
                        </SwiperSlide>

                        <SwiperSlide>
                            <img src="/assets/images/static_resources_testing/cat_3.jpg" alt="Slide 1" />
                        </SwiperSlide>

                        <SwiperSlide>
                            <img src="/assets/images/static_resources_testing/cat_4.jpeg" alt="Slide 1" />
                        </SwiperSlide>

                    </Swiper>

                </div>

                <div
               >
                    <IonSearchbar
                        animated={true}
                        color="secondary"
                        placeholder='Buscar por rasgo  , ejemplo : Lunar en el ojo , mancha blanca , etc'
                    />
                    
                </div>

                {/* Grid View Pets , DIV CONTAINER */}
                <div className="cards-grid">
                    {animalsJson.map((animal, idx: number) => (
                        <IonCard  
                        className="card-pets" key={animal.name ?? idx}>
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

                                <IonButton
                                    fill="clear"
                                    className="card-image-icon"
                                    onClick={() => console.log('favorite clicked', animal.name)}
                                    aria-label={`Favorito ${animal.name}`}
                                >
                                    <IonText title='Recompensa'> $$</IonText>
                                </IonButton>
                            </div>

                            <IonCardHeader>
                                <IonCardTitle className='title_name_pet_card'>{animal.name}</IonCardTitle>
                            </IonCardHeader>

                            <IonCardContent>
                                <IonText className='description_pet_card'>{animal.description}</IonText>
                            </IonCardContent>

                             <IonCardContent>
                               <IonRow>
                                 <IonIcon size='small' style={{  color: '#46b1ff ' }} icon={location} />

                                 <IonText style={{fontWeight:'bold'}}>
                                     Ultimo Lugar Visto : 
                                 </IonText>
                                
                          
                               </IonRow>

                               <IonRow>
      <IonText> 
                                    {animal.last_seen_place}
                                </IonText>
                               </IonRow>
                            </IonCardContent>
                            <IonCardContent className="keywords-row">
                                {animal.keywords && animal.keywords.map((kw, kidx) => (
                                    <IonButton
                                        key={kidx}
                                        fill="clear"
                                        className="keyword-chip"
                                        onClick={() => console.log('keyword clicked', kw)}
                                        aria-label={`Filtrar por ${kw}`}
                                    >
                                        <i className="fa-solid fa-hashtag" aria-hidden="true" />
                                        <span  style={{fontSize:10}}className="keyword-text">{kw}</span>
                                    </IonButton>
                                ))}
                            </IonCardContent>
                            
                            
                        </IonCard>
                    ))}

                </div>
            </IonContent>

        </IonPage>
    );
};

export default Board;
