import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Board.css';
import { card, cash, create, createOutline, heart, notificationsOutline, pencil, pencilOutline, personCircleOutline } from 'ionicons/icons';

// Settings to carrrousel - Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';


const Board: React.FC = () => {
    return (
        <IonPage className='blank_page'>

            <IonToolbar className="logo-toolbar">
                <IonButtons slot="start">
                    <img
                        src="/assets/images/logo_pet_find_me_sin_fondo_figma.png"
                        alt="Logo Pet Find Me"
                        className="logo-img"
                    />
                </IonButtons>

                <IonButtons slot="end">
                    <IonButton>
                        <IonIcon  style={{color:'#4ca5f8'}} icon={personCircleOutline} />
                    </IonButton>
                    <IonButton>
                        <IonIcon  style={{color:'#4ca5f8'}} icon={notificationsOutline} />
                    </IonButton>
                </IonButtons>
            </IonToolbar>


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

                {/* Grid View Pets */}
                <div>
<IonCard>
  <img src="URL_DE_LA_IMAGEN_DEL_PERRO" alt="Foto del perro" />
  <IonCardHeader>
    <IonCardTitle>Nombre del perro</IonCardTitle>
  </IonCardHeader>
  <IonCardContent>
                            <IonIcon size='large'  style={{color:'#ffffffff'}} icon={card} />

    <IonIcon name="heart" slot="end">ICONO</IonIcon>
  </IonCardContent>
</IonCard>

                </div>
            </IonContent>

        </IonPage>
    );
};

export default Board;
