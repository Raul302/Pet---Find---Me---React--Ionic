import { IonCard, IonContent, IonHeader, IonLabel, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar, IonChip, IonAvatar, IonTextarea, IonButton, IonIcon, IonInput, IonText, IonCol, IonRow, useIonViewWillLeave, IonToast } from '@ionic/react';
import './PetsDetail.css';
import AppHeader from '../../components/Header/AppHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
// import { animalsJson } from '../../hardcoded/Grid_Animals/StaticElements'; // Static data for animals
import { sendOutline, heartOutline, heart, cameraOutline, location as location_icon, locateOutline, body, thumbsUp, thumbsDownOutline, thumbsUpOutline, thumbsUpSharp, close } from 'ionicons/icons';
import React from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { api_endpoint } from '../../config/api';
import InitialsCircle from '../../hooks/Helper/FormatedNameBox/NameFormatedBox';
import { timeAgo } from '../../utils/timeAgo';
import { useHistory } from 'react-router';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';



interface Photo {
  url: string;
}

interface Animal {
  id: number;
  name: string;
  photos: Photo[];
  description?: string;
  address?: string;
  keywords?: string[];
  reward?: boolean;
}


const PetsDetail: React.FC = () => {


  const { fetchPets } = React.useContext(AuthContext);
// PetsDetail mounted
  // Information user
  const data_user = localStorage.getItem('data_user') || '';

  const { id } = useParams<{ id: string }>();
  const { selectedPet, setSelectedPet, pets, user } = React.useContext(AuthContext) as any;
  const [animal, setAnimal] = useState<any | null>(selectedPet ?? null);

  useEffect(() => {
    if (selectedPet) {
      setAnimal(selectedPet);
      return;
    }
    if (pets && id) {
      const found = pets.find((p: any) => String(p.id) === String(id));
      if (found) setAnimal(found);
    }
  }, [selectedPet, pets, id]);

  const [selectedTab, setSelectedTab] = useState('About');
  const [newComment, setNewComment] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactContactInfo, setContactContactInfo] = useState('');
  const [contactPhotos, setContactPhotos] = useState<string[]>([]);
  const [contactLocation, setContactLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [contactAddress, setContactAddress] = useState<string | null>(null);
  const [hasContactedOwner, setHasContactedOwner] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  const history = useHistory();
  const [toastOpen, setToastOpen] = useState(false);
  const isClosed = animal?.status_post === 'closed';
  const currentUserId = user?.id ? String(user.id) : (() => {
    try {
      const parsed = JSON.parse(data_user || '{}');
      return parsed && (parsed.id || parsed.userId) ? String(parsed.id || parsed.userId) : null;
    } catch (e) {
      return null;
    }
  })();

  const handleLike = async (commentId: number, useful: boolean) => {

    const token = localStorage.getItem('accessToken') || '';

    const obj_to_send = {
      id: commentId,
      useful: useful ? false : true

    }
    try {
      const response = await fetch(`${api_endpoint}/comments/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(obj_to_send)
      });

      if (response.ok) {
        loadCommentsofPost(animal);
        // Notify the commenter that someone reacted to their comment
        try {
          const parsedUser = JSON.parse(data_user || '{}');
          const parsed = comments.find(c => c.id === commentId) as any;
          const targetUserId = parsed?.commenterId ?? null;
          const actorId = parsedUser?.id ?? null;
          if (targetUserId && actorId && String(targetUserId) !== String(actorId)) {
            const notifBody = {
              userId: targetUserId,
              actorId: actorId,
              actorName: parsedUser?.fullname ?? parsedUser?.name ?? null,
              type: 'reaction',
              title: `${parsedUser?.fullname ?? 'Alguien'} reaccionó a tu comentario`,
              icon: 'thumbs-up',
              targetUrl: `/tabs/pets/${animal?.id ?? ''}`
            };
            await fetch(`${api_endpoint}/notifications`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(notifBody)
            }).catch(e => console.warn('Notification create failed', e));
          }
        } catch (e) {
          console.warn('Failed creating like notification', e);
        }
      }

    } catch (error) {
      console.error('Error sending comment:', error);
    }


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
  

  const checkIfAlreadyhasMessages = async () => {
    if (!animal) return;
    try {
      const token = localStorage.getItem('accessToken') || '';
      const userObj = JSON.parse(data_user || '{}');
      const userId = userObj.id;
      if (!userId) return;
      const resp = await fetch(`${api_endpoint}/conversations/check/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userA: userId,
          userB: animal.owner_post,
          petId: animal.id
        })
      });
      if (!resp.ok) {
        setHasContactedOwner(false);
        return;
      }
      const json = await resp.json().catch(() => null);

      console.log('JSON RESPONSE',json);
      // backend may return boolean or { exists: true }
      const exists = typeof json === 'boolean' ? json : (json && (json.exists === true || json.exists === 'true')) ? true : false;
      setHasContactedOwner(Boolean(exists));
    } catch (err) {
      console.error('Error checking messages:', err);
      setHasContactedOwner(false);
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

  const handleTakePhoto = async () => {
    try {
      const remaining = 3 - contactPhotos.length;
      if (remaining <= 0) {
        setToastMsg('Ya alcanzaste el máximo de 3 fotos');
        setToastOpen(true);
        return;
      }
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        quality: 80,
        width: 1280,
      });
      const dataUrl = photo && (photo.dataUrl || (photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null));
      if (dataUrl) {
        setContactPhotos(prev => [...prev, dataUrl].slice(0, 3));
      }
    } catch (err) {
      console.warn('Camera error or cancelled', err);
    }
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
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setContactLocation({ lat, lng });
      // Reverse geocode using Nominatim (OpenStreetMap) as fallback
      (async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=es`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            const display = json.display_name || (json.address ? Object.values(json.address).join(', ') : null);
            if (display) {
              setContactAddress(display);
              alert('Ubicación capturada: ' + display);
              return;
            }
          }
        } catch (e) {
          // ignore and fallback to coords only
        }
        alert('Ubicación capturada');
      })();
    }, err => {
      alert('No se pudo obtener la ubicación: ' + err.message);
    });
  };


  const clearForm = () => {
    setContactMessage('');
    setContactContactInfo('');
    setContactPhotos([]);
    setContactLocation(null);

  }
const handleSendContact = async () => {
  const token = localStorage.getItem('accessToken') || '';
  const data_user = localStorage.getItem('data_user') || '{}';

  const formData = new FormData();

  // Agregar campos simples
  formData.append('content', contactMessage);
  formData.append('petId', animal?.id?.toString() ?? '');
  formData.append('status', 'new');
  formData.append('coords', contactLocation ? JSON.stringify(contactLocation) : '');
  formData.append('address', contactAddress ?? '');


formData.append('members', JSON.stringify([
  { id: JSON.parse(data_user).id, fullname: JSON.parse(data_user).fullname },
  { id: animal?.owner_post, fullname: animal?.owner_name }
]));

  // Agregar fotos (si son File o Blob)
  if (contactPhotos && contactPhotos.length > 0) {
    contactPhotos.forEach((photoBase64: string, index: number) => {
      // Convert base64 to Blob
      const byteString = atob(photoBase64.split(',')[1]);
      const mimeString = photoBase64.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append('photos', blob, `photo_${index}.jpg`);
    });
  }

  try {
    const resp = await fetch(`${api_endpoint}/conversations/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` 
      },
      body: formData
    });

    const data = await resp.json().catch(() => ([]));
    if (resp.ok) {
      setToastMsg('Mensaje Enviado al propietario');
      setToastOpen(true);
      
    } else {
      console.warn('Failed to fetch messages, using sample data');
    }
  } catch (err) {
    console.warn('Error fetching messages:', err);
  } finally {
    checkIfAlreadyhasMessages();
    clearForm();
  }

  if (!animal) {
    alert('No se encontró la mascota.');
    return;
  }

  // debug: message sent (removed console.log)
};


  if (!animal) {
    return (
      <IonPage className="blank_page">
        <IonContent fullscreen>
          <div style={{ padding: '20px', textAlign: 'center' }}>Animal no encontrado</div>
        </IonContent>
      </IonPage>
    );
  }


  // ++++++++++++++++++++++++++++++++++++++ COMMENTS SECTION ++++++++++++++++++++++++++++++++++++++
  const loadCommentsofPost = (animal: Animal) => {

    const token = localStorage.getItem('accessToken') || '';

    fetch(`${api_endpoint}/comments?petId=${animal.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(data => {
        setComments(data);
      })
      .catch(error => {
        console.error('Error fetching comments:', error);
      });
  }


  const sendComment = async (comment: string) => {

    const token = localStorage.getItem('accessToken') || '';



    const obj_to_send = {
      petId: animal.id,
      commenterId: JSON.parse(data_user).id,
      commenterName: JSON.parse(data_user).fullname,
      content: newComment,
      useful: 0,
      createdAt: new Date().toISOString()

    }


    try {
      const response = await fetch(`${api_endpoint}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(obj_to_send)
      });

      if (response.ok) {
        setNewComment('');
        loadCommentsofPost(animal);
        // Create a notification for the post owner about the new comment
        try {
          const parsedUser = JSON.parse(data_user || '{}');
          const actorId = parsedUser?.id ?? null;
          const targetUserId = animal?.owner_post ?? null;
          if (targetUserId && actorId && String(targetUserId) !== String(actorId)) {
            const notifBody = {
              userId: targetUserId,
              actorId: actorId,
              actorName: parsedUser?.fullname ?? parsedUser?.name ?? null,
              type: 'comment',
              title: `Nuevo comentario en ${animal?.name ?? 'tu publicación'}`,
              icon: 'comment',
              targetUrl: `/tabs/pets/${animal?.id ?? ''}`
            };
            await fetch(`${api_endpoint}/notifications`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(notifBody)
            }).catch(e => console.warn('Notification create failed', e));
          }
        } catch (e) {
          console.warn('Failed creating comment notification', e);
        }
      }

    } catch (error) {
      console.error('Error sending comment:', error);
    }

  }

  const colorOptions = ['#007bff', '#28a745', '#ff6600', '#6f42c1', '#17a2b8', '#103102ff', '#ff5733', '#33ff57', '#3357ff', '#ff33a8'];

  const userColorMap = useMemo(() => {
    const map: { [name: string]: string } = {};
    comments.forEach(comment => {
      const name = comment.commenterName;
      if (!map[name]) {
        const randomIndex = Math.floor(Math.random() * colorOptions.length);
        map[name] = colorOptions[randomIndex];
      }
    });
    return map;
  }, [selectedTab]);






  useEffect(() => {
    if (selectedTab === 'Post') {
      loadCommentsofPost(animal);
    }
    else if (selectedTab === 'Contact') {
      checkIfAlreadyhasMessages();
    }
  }, [selectedTab]);


  const closePost = async () => {



    try {
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${api_endpoint}/pets/${animal.id}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // body: JSON.stringify({ status_post: true })
      });
      if (response.ok) {
        setToastMsg('Post cerrado exitosamente');
        setToastOpen(true);
        setSelectedTab('About');
        fetchPets?.();
      const json = await response.json();
      setSelectedPet(json);

        
        // history.push('/tabs/board');
      } else {
        const txt = await response.text().catch(() => `HTTP ${response.status}`);
        setToastMsg('Error cerrando el post: ' + txt);
        setToastOpen(true);
      }
    } catch (error) {
      const msg = (error as any)?.message || String(error);
      console.error('Error cerrando el post:', error);
      setToastMsg('Error cerrando el post: ' + msg + '. Si el mensaje es "Failed to fetch", puede ser un problema de CORS o que el servidor no responde.');
      setToastOpen(true);
    }
    // setAnimal(null);

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



            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              pagination={{ clickable: true }}
              loop={(animal.photos && animal.photos.length > 3) || false}
              // autoplay={imageUrls.length > 1 ? { delay: 3000 } : false}
              modules={[Pagination]}
              className="swiper-custom"
            >
              {animal.photos &&
                [animal.photos.map((imgUrl: Photo, i: number) => (
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
                        src={imgUrl.url}
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
                ))]
              }
            </Swiper>


          )}
          {selectedTab === 'About' && (
            <div className="pet-info-section">
              <h1 className="pet-name">{animal.name}</h1>

              <div className="pet-detail-item">
                <span className="detail-label">Descripción:</span>
                <span className="detail-value">{animal.description}</span>
              </div>

              <div className="pet-detail-item">
                <IonRow>
                  <IonCol size="12" className="ion-text-start">
                    <IonIcon size="small" style={{ color: 'var(--color-primary)' }} icon={location_icon} />
                    <IonText className="detail-label">Última ubicación</IonText>
                  </IonCol>
                </IonRow>

                {/* <span className="detail-label">Última ubicación:</span> */}
                <span className="detail-value">{animal.address}</span>
              </div>

              <div className="pet-detail-item">
                <span className="detail-label">Señas particulares:</span>
                <div className="detail-value">
                  {animal.keywords &&
                    animal.keywords.map((kw: any, kidx: number) => (
                      <IonButton
                        key={kidx}
                        fill="clear"
                        className="keyword-chip"
                        aria-label={`Filtrar por ${kw}`}
                      >
                        <i className="fa-solid fa-hashtag" aria-hidden="true" />
                        <span style={{ fontSize: 10 }} className="keyword-text">
                          {kw}
                        </span>
                      </IonButton>
                    ))}
                </div>
              </div>

              <div className="pet-detail-item">
                <span className="detail-label">Recompensa:</span>
                <span className="detail-value">{animal.reward ? 'Sí' : 'No'}</span>
              </div>

              {animal.owner_post === JSON.parse(data_user).id && animal.status_post !== 'closed' && (
                <IonButton
                fill="solid"
                color="danger"
                onClick={() => closePost()}
                style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 1000 }}
                aria-label="Cerrar Post"
              >
                <IonIcon icon={close} />
                &nbsp;Cerrar Post
              </IonButton>
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
                      <InitialsCircle
                        bgColor={userColorMap[comment.commenterName]}

                        fullname={comment.commenterName} />
                    </IonAvatar>
                    <div className="comment-content">
                      <div className="comment-bubble">
                        <div className="comment-user-name">{comment.commenterName}</div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                      <div className="comment-actions">
                        <span className="comment-timestamp">{timeAgo(comment.createdAt)}</span>
                        {!(comment.commenterId !== undefined && String(comment.commenterId) === String(currentUserId)) && (
                          <button
                            className={`like-button ${comment.useful ? 'liked' : ''}`}
                            onClick={() => handleLike(comment.id, comment.useful)}
                            disabled={isClosed}
                          >
                            <IonIcon icon={comment.useful ? thumbsUpSharp : thumbsUp} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input area */}
              {isClosed ? (
                <div style={{ padding: 12, color: '#333', fontWeight: 600 }}>
                  Esta publicación está cerrada. Ya no se pueden añadir comentarios.
                </div>
              ) : (
                <div className="comment-input-wrapper">
                  <IonAvatar className="comment-avatar">

                    <InitialsCircle fullname={JSON.parse(data_user).fullname} size={40} bgColor="#007bff" textColor="#fff" />
                  </IonAvatar>
                  <div className="comment-input-container">
                    <IonTextarea
                      className="comment-input black-text"
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onIonInput={e => setNewComment(e.detail.value || '')}
                      autoGrow={true}
                      rows={1}
                    />
                    <IonButton
                      className="send-comment-btn"
                      fill="clear"
                      onClick={() => sendComment(newComment)}
                      disabled={!newComment.trim()}
                    >
                      <IonIcon icon={sendOutline} />
                    </IonButton>
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedTab === 'Contact' && (
            isClosed  ? (
              <div className="contact-section">
                <div className="contact-info">
                  <h2>Contacto</h2>
                  <div style={{ padding: 12, color: '#333', fontWeight: 600 }}>
                    Esta publicación está cerrada. No se pueden enviar mensajes al propietario.
                  </div>
                </div>
              </div>
            ) : (
              hasContactedOwner  || (animal.owner_post == currentUserId) ? (
                <div className="contact-section">
                  <div className="contact-info">
                    <h2>Contacto</h2>
                    <div style={{ padding: 12, color: '#333', fontWeight: 600 }}>
                      Ya has contactado al dueño de la publicación.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="contact-section">
                  <div className="contact-info">
                    <h2>Mensaje</h2>
                    <IonTextarea
                      className="contact-textarea"
                      placeholder="Escribe un mensaje para el propietario..."
                      value={contactMessage}
                      onIonInput={e => setContactMessage(e.detail.value || '')}
                      rows={4}
                      disabled={isClosed}
                    />



                    <div className="contact-actions">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={e => handleSelectPhotos(e.target.files)}
                        disabled={isClosed}
                      />
                      <IonButton disabled fill="outline" onClick={() => fileInputRef.current?.click()}>
                        <IonIcon icon={cameraOutline} />
                        &nbsp;Fotos ({contactPhotos.length}/3)
                      </IonButton>
                      <IonButton fill="outline" onClick={handleTakePhoto} disabled={contactPhotos.length >= 3 || isClosed}>
                        <IonIcon icon={cameraOutline} />
                        &nbsp;Cam/Galería
                      </IonButton>
                      <IonButton fill="outline" onClick={handleShareLocation} disabled={isClosed}>
                        <IonIcon icon={locateOutline} />
                        &nbsp;Enviar ubicación
                      </IonButton>
                      <IonButton onClick={handleSendContact}
                        disabled={isClosed || !contactMessage.trim() || contactPhotos.length === 0 || !contactLocation}>
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
                        <div className="location-preview">Ubicación: {contactAddress ? contactAddress : `${contactLocation.lat.toFixed(4)}, ${contactLocation.lng.toFixed(4)}`}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )
          )}
          {selectedTab === 'other' && <div>Otras mascotas relacionadas</div>}
        </IonContent>

        <IonToast position='top' isOpen={toastOpen} message={toastMsg} onDidDismiss={() => setToastOpen(false)} duration={4000} />


      </IonContent>
    </IonPage>
  );
};

export default PetsDetail; // Exporting the PetsDetail component
