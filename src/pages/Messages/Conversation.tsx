import React, { useMemo, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';
import { IonPage, IonContent, IonButton, IonToolbar, IonTitle, IonAvatar, IonIcon, IonModal, IonHeader, IonButtons, IonTextarea, IonText, IonToast } from '@ionic/react';
import AppHeader from '../../components/Header/AppHeader';
import './Messages.css';
import { api_endpoint } from '../../config/api';
import InitialsCircle from '../../hooks/Helper/FormatedNameBox/NameFormatedBox';
import { thumbsUp, thumbsUpSharp, closeOutline, sendOutline, receipt, locateOutline, closeCircle } from 'ionicons/icons';
import { timeAgo } from '../../utils/timeAgo';
import { useHistory } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useShareLocation } from '../../hooks/SharingLocation/SharingLocation';

const makeThread = (id: string) => {
    // Simple fake thread based on id for preview
    const now = Date.now();
    return [
        { id: `${id}-1`, from: 'me', text: 'Hola, ¿estás ahí?', ts: new Date(now - 1000 * 60 * 60).toISOString() },
        { id: `${id}-2`, from: 'them', text: 'Sí, acabo de ver tu reporte. ¿Puedes enviarme la ubicación exacta?', ts: new Date(now - 1000 * 45).toISOString() },
        { id: `${id}-3`, from: 'me', text: 'Claro, te la envío ahora.', ts: new Date(now - 1000 * 30).toISOString() }
    ];
}

const Conversation: React.FC = () => {
    const history = useHistory();
    const { fetchConversationsByPet, selectedConversation, setSelectedConversation } = useContext(AuthContext) as any;

    console.log('selectedConversation', selectedConversation);
    const [isSharing, setIsSharing] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState<any[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);

    const isExpired = expiresAt && new Date() > expiresAt;

    const sendMessage = async (text: string) => {
        const trimmed = (text || '').trim();
        if (!trimmed) return;
        const token = localStorage.getItem('accessToken') || '';
        const data_user = JSON.parse(localStorage.getItem('data_user') || '{}');
        const msg = {
            content: trimmed,
            senderId: data_user.id,
            senderName: data_user.fullname || 'Yo',
            createdAt: new Date().toISOString(),
            petId: selectedConversation?.petId || null,
            recipientId: selectedConversation?.recipientId || null,
            receipientName: selectedConversation?.recipientName || 'Desconocido',
            useful: false
        };

        const formData = new FormData();

        // Agregar campos simples
        formData.append('content', msg.content);
        formData.append('petId', msg.petId?.toString() ?? '');
        formData.append('senderId', msg.senderId?.toString() ?? '');
        formData.append('senderName', msg.senderName ?? '');
        formData.append('recipientId', msg.recipientId?.toString() ?? '');
        formData.append('recipientName', msg.receipientName ?? '');
        formData.append('status', 'new');
        formData.append('useful', 'false');
        formData.append('reported', 'false');


        setConversation(prev => [...prev, msg]);
        setNewMessage('');
        try {
            await fetch(`${api_endpoint}/direct-messages`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData
            });
        } catch (err) {
            console.warn('Failed to send message', err);
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            if (selectedConversation) {
                const resp = await fetchConversationsByPet(selectedConversation.petId);
                setConversation(resp || []);
                setLoading(false);
                console.log('RESP', resp);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConversation]);

    const fetchConversation = async () => {
        if (!selectedConversation) return;
        const convId = selectedConversation.id || selectedConversation.conversationId;
        const token = localStorage.getItem('accessToken') || '';

        setLoading(true);
        try {
            const resp = await fetch(`${api_endpoint}/direct-messages/conversation/${convId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json().catch(() => ([]));
            if (resp.ok) {
                setConversation(data);
            } else {
                console.warn('Failed to fetch messages, using sample data');
            }
        } catch (err) {
            console.warn('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleShareLocationClick = () => {
        if (!navigator.geolocation) {
            setToastMsg('Geolocalización no soportada en este navegador');
            setToastOpen(true);
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setToastMsg(`Ubicación capturada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setToastOpen(true);
        }, err => {
            setToastMsg('No se pudo obtener la ubicación: ' + err.message);
            setToastOpen(true);
        });
    };

    const handleReport = () => {
        // Placeholder: you can call an API to report the conversation/message
        setToastMsg('Reporte enviado');
        setToastOpen(true);
    };

    const handleCloseAndRate = () => {
        // Placeholder: close conversation and navigate back to messages
        try { setSelectedConversation?.(null); } catch (e) { }
        history.push('/tabs/messages');
        setToastMsg('Cerrar y valorar - acción realizada');
        setToastOpen(true);
    };

    const handleOpenRateModal = () => setShowRateModal(true);
    const handleRateSubmit = (val: 'useful' | 'not_useful') => {
        const msg = val === 'useful' ? 'Gracias — útil' : 'Gracias — no útil';
        setToastMsg(msg);
        setToastOpen(true);
        setShowRateModal(false);
        try { setSelectedConversation?.(null); } catch (err) { }
        history.push('/tabs/messages');
        // TODO: send rating to backend if you have an endpoint
    };
    const colorOptions = ['#007bff', '#28a745', '#ff6600', '#6f42c1', '#17a2b8', '#103102ff', '#ff5733', '#33ff57', '#3357ff', '#ff33a8'];

    const userColorMap = useMemo(() => {
        const map: { [name: string]: string } = {};
        conversation.forEach(m => {
            const name = m.senderName || 'Usuario';
            if (!map[name]) map[name] = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        });
        return map;
    }, [conversation]);



    // ============================================= SHARING LOCATION SCOKETS =================================================

    const handleShareLocation = async () => {
        try {
            const token = localStorage.getItem('accessToken') || '';
            const user = JSON.parse(localStorage.getItem('data_user') || '{}');

            if (!user?.id || !token) {
                alert('Inicia sesión para compartir ubicación.');
                return;
            }

            const resp = await fetch(`${api_endpoint}/live-location/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    durationMinutes: 5,
                    coords: user.coords || null,
                }),
            });

            const data = await resp.json();
            if (!resp.ok || !data?.link) {
                alert('No se pudo generar el link de ubicación.');
                return;
            }
            setIsSharing(true);
            setExpiresAt(new Date(data.expiresAt));
            setShareToken(data.shareToken);
            const message = `Hola, te comparto mi ubicación en tiempo real (5 min): ${data.link}`;

            if (Capacitor.isNativePlatform()) {
                // 📱 App nativa (Android/iOS)
                await Share.share({
                    title: 'Ubicación en tiempo real',
                    text: message,
                    url: data.link,
                });
            } else {
                // 💻 Navegador web
                const encoded = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/?text=${encoded}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (err) {
            console.error(err);
            alert('Error al compartir ubicación.');
        }
    };

    useEffect(() => {
        if (expiresAt) {
            const timer = setTimeout(() => {
                setIsSharing(false);
                setShareToken(null);
                setExpiresAt(null);
            }, expiresAt.getTime() - Date.now());

            return () => clearTimeout(timer);
        }
    }, [expiresAt]);

function ShareLocationSession({  durationMinutes, shareToken }: {  durationMinutes: number, shareToken: string }) {
    console.log('SHARELOCATIONSESSION CALLED IN CONVERSATION.TSX');
    const user = localStorage.getItem('data_user') ? JSON.parse(localStorage.getItem('data_user') || '{}') : null;
    useShareLocation(user.id, durationMinutes, shareToken);
  return null; // no renderiza nada, solo activa el hook
}


    return (
        <IonPage>
            <AppHeader />
            <IonToolbar style={{ padding: 12 }}>
                <IonButton onClick={() => history.push('/tabs/messages')} slot="start">Atrás</IonButton>
                <IonTitle style={{ textAlign: 'center' }}>{selectedConversation?.pet?.name ?? 'Conversación'}</IonTitle>
                <IonButtons slot="end">
                    {isExpired ?
                        <IonButton
                            onClick={handleOpenRateModal}
                            color={"tertiary"} size='small' fill="outline"  >
                            <IonIcon icon={closeCircle} />
                            &nbsp;Cerrar y valorar
                        </IonButton>
                        :
                        <IonButton
                            onClick={handleShareLocation}
                            color={"tertiary"} size='small' fill="outline" disabled={isSharing} >
                            <IonIcon icon={locateOutline} />
                            &nbsp;{isSharing ? '📡 Compartiendo…' : 'Compartir ubicación'}                    </IonButton>
                    }
                </IonButtons>

                    {/* Montamos el hook solo mientras está compartiendo */}
                    {isSharing && shareToken && (
                        <ShareLocationSession  durationMinutes={5} shareToken={shareToken} />
                    )}

                <IonModal isOpen={showRateModal} onDidDismiss={() => setShowRateModal(false)} className="rate-modal">
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Cerrar y valorar</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <p>¿Fue útil esta conversación?</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <IonButton className="rate-btn useful" expand="block" color="primary" onClick={() => handleRateSubmit('useful')}>Útil</IonButton>
                            <IonButton className="rate-btn not-useful" expand="block" color="medium" onClick={() => handleRateSubmit('not_useful')}>No útil</IonButton>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <IonButton className="rate-cancel" fill="clear" onClick={() => setShowRateModal(false)}>Cancelar</IonButton>
                        </div>
                    </IonContent>
                </IonModal>
            </IonToolbar>
            <IonContent>
                <div style={{ padding: 12 }}>
                    <div className="comments-section">
                        {/* Comments list */}
                        <div className="comments-list">
                            {conversation.map(conversation => (
                                <div key={conversation.id} className="comment-item">
                                    <IonAvatar className="comment-avatar">
                                        <InitialsCircle
                                            bgColor={userColorMap[conversation.senderName]}

                                            fullname={conversation.senderName} />
                                    </IonAvatar>
                                    <div className="comment-content">
                                        <div className="comment-bubble">
                                            <div className="comment-user-name">{conversation.senderName}</div>
                                            <div className="comment-text">{conversation.content}</div>
                                            {conversation.photos && Array.isArray(conversation.photos) && conversation.photos.length > 0 && (
                                                <div className="comment-photos" style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                                    {conversation.photos.map((p: any, i: number) => {
                                                        const url = typeof p === 'string' ? p : (p.url || '');
                                                        return (
                                                            <img
                                                                key={i}
                                                                src={url}
                                                                alt={`photo-${i}`}
                                                                style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                                                                onClick={() => setSelectedPhoto(url)}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            )}
                                            <IonText style={{ color: '#b8adadff', fontWeight: '300', fontSize: 12, marginTop: 8, display: 'block' }}>
                                                {conversation?.address}
                                            </IonText>
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>



                    </div>
                </div>

                {/* Message input */}
                <div className="comment-input-container" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
                    <IonTextarea
                        className="comment-input black-text"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onIonInput={e => setNewMessage(e.detail.value || '')}
                        autoGrow={true}
                        rows={1}
                        style={{ flex: 1, minHeight: 40, maxHeight: 160 }}
                    />
                    <IonButton
                        className="send-comment-btn"
                        fill="clear"
                        onClick={() => sendMessage(newMessage)}
                        disabled={!newMessage.trim()}
                    >
                        <IonIcon icon={sendOutline} />
                    </IonButton>
                </div>

                {/* Full photo modal */}
                <IonModal isOpen={selectedPhoto !== null} onDidDismiss={() => setSelectedPhoto(null)} className="photo-modal">
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={() => setSelectedPhoto(null)}>
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </IonButtons>
                            <IonTitle>Foto</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                            {selectedPhoto && <img src={selectedPhoto} alt="full" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 6 }} />}
                        </div>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
}

export default Conversation;
