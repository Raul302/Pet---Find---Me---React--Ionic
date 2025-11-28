import { IonCard, IonContent, IonHeader, IonLabel, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar, IonChip, IonAvatar, IonTextarea, IonButton, IonIcon, IonInput } from '@ionic/react';
import './PetsDetail.css';
import AppHeader from '../../components/Header/AppHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { animalsJson } from '../../hardcoded/Grid_Animals/StaticElements';
import { sendOutline, heartOutline, heart, cameraOutline, locateOutline } from 'ionicons/icons';
import React from 'react';



const PetsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const animal = animalsJson.find(a => a.id === parseInt(id || '0'));
  
  const [selectedTab, setSelectedTab] = useState('About');
  const [newComment, setNewComment] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactContactInfo, setContactContactInfo] = useState('');
  const [contactPhotos, setContactPhotos] = useState<string[]>([]);
  const [contactLocation, setContactLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      userName: 'María González',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      comment: '¡Lo vi cerca del parque ayer! Parecía estar bien.',
      timestamp: 'Hace 2 horas',
      likes: 5,
      liked: false
    },
    {
      id: 2,
      userName: 'Carlos Ramírez',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      comment: 'Espero que lo encuentren pronto. Compartiré la publicación.',
      timestamp: 'Hace 5 horas',
      likes: 3,
      liked: false
    },
    {
      id: 3,
      userName: 'Ana Torres',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      comment: 'Creo que vi un animal parecido en la Colonia Centro. ¿Todavía lo están buscando?',
      timestamp: 'Hace 1 día',
      likes: 8,
      liked: false
    }
  ]);

  const handleLike = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          liked: !comment.liked,
          likes: comment.liked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: comments.length + 1,
        userName: 'Usuario Actual',
        userAvatar: 'https://i.pravatar.cc/150?img=8',
        comment: newComment,
        timestamp: 'Justo ahora',
        likes: 0,
        liked: false
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };

  const handleSelectPhotos = (files: FileList | null) => {
    if (!files) return;
    const max = 3;
    const fileArray = Array.from(files).slice(0, max);
    const readers = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setContactPhotos(prev => [...prev, ...results].slice(0, 3));
    }).catch(() => alert('Error leyendo las imágenes'));
  };

  const handleRemovePhoto = (index: number) => {
    setContactPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en este navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      setContactLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      alert('Ubicación capturada');
    }, err => {
      alert('No se pudo obtener la ubicación: ' + err.message);
    });
  };

  const handleSendContact = () => {
    if (!animal) {
      alert('No se encontró la mascota.');
      return;
    }
    console.log('Enviar mensaje al propietario:', {
      message: contactMessage,
      contactInfo: contactContactInfo,
      photos: contactPhotos,
      location: contactLocation,
      petId: animal?.id ?? null,
    });
    alert('Mensaje preparado. (Mock)');
    setContactMessage('');
    setContactContactInfo('');
    setContactPhotos([]);
    setContactLocation(null);
  };

  if (!animal) {
    return (
      <IonPage className="blank_page">
        <AppHeader />
        <IonContent fullscreen>
          <div style={{ padding: '20px', textAlign: 'center' }}>Animal no encontrado</div>
        </IonContent>
      </IonPage>
    );
  }


  return (
    <IonPage className="blank_page">
      <AppHeader />
      <IonContent fullscreen>
       <IonToolbar>


         <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
          <IonSegmentButton value="About">
            <IonLabel>Acerca de</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Post">
            <IonLabel>Comentarios</IonLabel>
          </IonSegmentButton>

           <IonSegmentButton value="Contact">
            <IonLabel>Contacto</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonToolbar>

       <IonContent>
        {selectedTab === 'About' && (
          <div className="carousel-cards-wrapper">
           <Swiper
                       spaceBetween={20}
                      slidesPerView={3}
                      loop={true}
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
        )}
        {selectedTab === 'About' && (
          <div className="pet-info-section">
            <h1 className="pet-name">{animal.name}</h1>
            
            <div className="pet-detail-item">
              <span className="detail-label">Descripción:</span>
              <span className="detail-value">{animal.description}</span>
            </div>

            <div className="pet-detail-item">
              <span className="detail-label">Última ubicación:</span>
              <span className="detail-value">{animal.last_seen_place}</span>
            </div>

            <div className="pet-detail-item">
              <span className="detail-label">Señas particulares:</span>
              <div className="detail-value">
                {animal.particular_signs.map((sign, index) => (
                  <div key={index}>• {sign}</div>
                ))}
              </div>
            </div>

            <div className="pet-detail-item">
              <span className="detail-label">Recompensa:</span>
              <span className="detail-value">{animal.reward ? 'Sí' : 'No'}</span>
            </div>

            {animal.keywords && animal.keywords.length > 0 && (
              <div className="pet-detail-item">
                <span className="detail-label">Palabras clave:</span>
                <div className="keywords-row">
                  {animal.keywords.map((keyword, index) => (
                    <IonChip key={index} className="keyword-chip">
                      <i className="fa-solid fa-hashtag"></i>
                      {keyword}
                    </IonChip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {selectedTab === 'Post' && (
          <div className="comments-section">
            {/* Comments list */}
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <IonAvatar className="comment-avatar">
                    <img src={comment.userAvatar} alt={comment.userName} />
                  </IonAvatar>
                  <div className="comment-content">
                    <div className="comment-bubble">
                      <div className="comment-user-name">{comment.userName}</div>
                      <div className="comment-text">{comment.comment}</div>
                    </div>
                    <div className="comment-actions">
                      <span className="comment-timestamp">{comment.timestamp}</span>
                      <button 
                        className={`like-button ${comment.liked ? 'liked' : ''}`}
                        onClick={() => handleLike(comment.id)}
                      >
                        <IonIcon icon={comment.liked ? heart : heartOutline} />
                        <span className="like-count">{comment.likes > 0 ? comment.likes : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input area */}
            <div className="comment-input-wrapper">
              <IonAvatar className="comment-avatar">
                <img src="https://i.pravatar.cc/150?img=8" alt="Tu avatar" />
              </IonAvatar>
              <div className="comment-input-container">
                <IonTextarea
                  className="comment-input"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onIonInput={e => setNewComment(e.detail.value || '')}
                  autoGrow={true}
                  rows={1}
                />
                <IonButton 
                  className="send-comment-btn"
                  fill="clear"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <IonIcon icon={sendOutline} />
                </IonButton>
              </div>
            </div>
          </div>
        )}
        {selectedTab === 'Contact' && (
          <div className="contact-section">
            <div className="contact-info">
              <h2>Mensaje</h2>
              <IonTextarea
                className="contact-textarea"
                placeholder="Escribe un mensaje para el propietario..."
                value={contactMessage}
                onIonInput={e => setContactMessage(e.detail.value || '')}
                rows={4}
              />
              

             
              <div className="contact-actions">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={e => handleSelectPhotos(e.target.files)}
                />
                <IonButton fill="outline" onClick={() => fileInputRef.current?.click()}>
                  <IonIcon icon={cameraOutline} />
                  &nbsp;Fotos ({contactPhotos.length}/3)
                </IonButton>
                <IonButton fill="outline" onClick={handleShareLocation}>
                  <IonIcon icon={locateOutline} />
                  &nbsp;Compartir ubicación
                </IonButton>
                <IonButton onClick={handleSendContact} disabled={!contactMessage.trim() && contactPhotos.length === 0 && !contactLocation}>
                  Enviar
                </IonButton>
              </div>

              <div className="contact-thumbs">
                {contactPhotos.map((p, idx) => (
                  <div key={idx} className="thumb-wrapper">
                    <img src={p} alt={`photo-${idx}`} />
                    <button className="remove-photo" onClick={() => handleRemovePhoto(idx)}>×</button>
                  </div>
                ))}
                {contactLocation && (
                  <div className="location-preview">Ubicación: {contactLocation.lat.toFixed(4)}, {contactLocation.lng.toFixed(4)}</div>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedTab === 'other' && <div>Otras mascotas relacionadas</div>}
      </IonContent>



      </IonContent>
    </IonPage>
  );
};

export default PetsDetail;
