import React, { useMemo, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';
import { IonPage, IonContent, IonButton, IonToolbar, IonTitle, IonAvatar, IonIcon, IonModal, IonHeader, IonButtons, IonTextarea, IonText, IonToast } from '@ionic/react';
import AppHeader from '../../components/Header/AppHeader';
import './Messages.css';
import { api_endpoint } from '../../config/api';
import InitialsCircle from '../../hooks/Helper/FormatedNameBox/NameFormatedBox';
import { closeOutline, sendOutline, locateOutline, closeCircle, radioOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useShareLocation } from '../../hooks/SharingLocation/SharingLocation';
import { Geolocation } from '@capacitor/geolocation';

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
    const { selectedConversation, setSelectedConversation, user: authUser } = useContext(AuthContext) as any;


    console.log('selectedConersation',selectedConversation);
    const [isSharing, setIsSharing] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const [conversation, setConversation] = useState<any[]>(selectedConversation?.messages ?? []);

    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('data_user') || '{}');
        } catch (err) {
            console.warn('Failed to parse stored user', err);
            return {};
        }
    }, []);

    const currentUserId = authUser?.id ?? storedUser?.id ?? storedUser?.userId ?? null;

    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);

    const isExpired = expiresAt && new Date() > expiresAt;

    useEffect(() => {
        if (selectedConversation?.messages) {
            setConversation(selectedConversation.messages);
        } else {
            setConversation([]);
        }
    }, [selectedConversation]);


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
            const name = m.senderName || m.userName || m.user?.fullname || m.user?.name || 'Usuario';
            if (!map[name]) map[name] = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        });
        return map;
    }, [conversation]);



    // ============================================= SHARING LOCATION SCOKETS =================================================

    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }


    const shareOnWhatsApp = (message: string) => {

        const encoded = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encoded}`;

        if (isIOS()) {
            // iOS Safari prefers direct navigation
            window.location.assign(whatsappUrl);
        } else if (isAndroid()) {
            // Android browsers usually allow new tab
            window.open(whatsappUrl, '_blank');
        } else {
            // Fallback for desktop/web
            window.open(whatsappUrl, '_blank');
        }
    }

    const getMandatoryCoordinates = async () => {

        setToastOpen(true);
        setToastMsg("Obteniendo ubicación...");
        if (Capacitor.getPlatform() === 'web') {
            if (!('geolocation' in navigator)) {
                return { success: false, reason: 'Geolocalización no disponible en este navegador.' };
            }

            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                });

                return {
                    success: true,
                    coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                };
            } catch (err: any) {
                const permissionDenied = typeof err?.code === 'number' && err.code === err.PERMISSION_DENIED;
                const reason = permissionDenied ? 'Permiso de ubicación denegado.' : (err?.message || 'No se pudo obtener la ubicación.');
                return { success: false, reason };
            }
        }

        try {
            const permStatus = await Geolocation.checkPermissions();

            if (permStatus.location !== 'granted') {
                const req = await Geolocation.requestPermissions();
                if (req.location !== 'granted') {
                    return { success: false, reason: 'Permiso de ubicación denegado.' };
                }
            }

            const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            return {
                success: true,
                coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            };
        } catch (err: any) {
            console.warn('Error al obtener ubicación con Capacitor Geolocation', err);
            return { success: false, reason: 'No se pudo obtener la ubicación.' };
        }
    };

    const handleShareLocation = async () => {

        const coordsResult = await getMandatoryCoordinates();

        if (!coordsResult.success || !coordsResult.coords) {
            setToastMsg(coordsResult.reason || 'No se pudo obtener la ubicación. Por favor, intenta de nuevo.');
            setToastOpen(true);
            return;
        }
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
                    coords: coordsResult.coords || null,
                }),
            });

            const data = await resp.json();
            if (!resp.ok || !data?.link) {
                alert('No se pudo generar el link de ubicación.');
                return;
            }
            console.log('SHAAAAA',data);
            setIsSharing(true);
            setExpiresAt(new Date(data.expiresAt));
            setShareToken(data.shareToken);
            const message = `Hola, te comparto mi ubicación en tiempo real (5 min): ${data.link}`;

            const shareApi = (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share;
            let shareHandled = false;

            try {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'Ubicación en tiempo real',
                        text: message,
                        url: data.link,
                    });
                    shareHandled = true;
                } else if (typeof shareApi === 'function') {
                    await shareApi({
                        title: 'Ubicación en tiempo real',
                        text: message,
                        url: data.link,
                    });
                    shareHandled = true;
                }
            } catch (err) {
                console.warn('Share failed, fallback to WhatsApp link', err);
            }

            if (!shareHandled) {
                shareOnWhatsApp(message);
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

    function ShareLocationSession({ durationMinutes, shareToken }: { durationMinutes: number, shareToken: string }) {
        console.log('SHARELOCATIONSESSION CALLED IN CONVERSATION.TSX');
        const user = localStorage.getItem('data_user') ? JSON.parse(localStorage.getItem('data_user') || '{}') : null;
        const userId = Number(user?.id ?? 0);
        useShareLocation(userId, durationMinutes, shareToken);
        return null; // no renderiza nada, solo activa el hook
    }

    const sendMessage = async (content: string) => {
        if (!selectedConversation) return;
        const token = localStorage.getItem('accessToken') || '';
        const dataUser = Object.keys(authUser ?? {}).length ? authUser : storedUser;
        const parsedCurrentId = currentUserId != null ? Number(currentUserId) : undefined;
        const senderId = Number.isFinite(parsedCurrentId) ? parsedCurrentId : dataUser?.id ?? null;

        fetch(`${api_endpoint}/conversations/${selectedConversation.id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                content,
                userId: senderId,
                coords: dataUser?.coords || null,
                address: dataUser?.address || '',
                staus: 'sent'
            }),
        })
            .then(async res => {
                if (!res.ok) {
                    const message = await res.text().catch(() => '');
                    throw new Error(message || `HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                const senderName = data?.senderName || dataUser?.fullname || dataUser?.name || 'Yo';
                const normalisedMessage = {
                    ...data,
                    senderId: data?.senderId ?? data?.userId ?? senderId ?? null,
                    senderName
                };
                setConversation(prev => [...prev, normalisedMessage]);
                setNewMessage('');
            })
            .catch(err => {
                console.error('Error sending message:', err);
                setToastMsg('Error al enviar el mensaje');
                setToastOpen(true);
            });
    };

    return (
        <IonPage>
            {/* <AppHeader /> */}
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
                            <IonIcon icon={isSharing ? radioOutline : locateOutline} />
                            &nbsp;{isSharing ? 'Compartiendo…' : 'Compartir ubicación'}
                        </IonButton>
                    }
                </IonButtons>

                {/* Montamos el hook solo mientras está compartiendo */}
                {isSharing && shareToken && (
                    <ShareLocationSession durationMinutes={5} shareToken={shareToken} />
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
                    <div className="comments-section conversation-thread">
                        {/* Comments list */}
                        <div className="comments-list">
                            {conversation.map((message, index) => {
                                const messageSenderId = message?.senderId ?? message?.userId ?? message?.sender_id ?? message?.sender?.id ?? message?.user?.id ?? null;
                                const isOwnMessage = currentUserId != null && messageSenderId != null && String(messageSenderId) === String(currentUserId);
                                const senderDisplayName = message?.sender?.fullname || 'Usuario';
                                const paletteKey = senderDisplayName;
                                const messageKey = message?.id ?? `msg-${index}-${message?.createdAt ?? Date.now()}`;

                                return (
                                    <div key={messageKey} className={`comment-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                                        <IonAvatar className="comment-avatar">
                                            <InitialsCircle
                                                bgColor={isOwnMessage ? '#ff6600' : '#007bff'}
                                                fullname={senderDisplayName} />
                                        </IonAvatar>
                                        <div className="comment-content">
                                            <div className="comment-bubble" style={{ textAlign: isOwnMessage ? 'left' : 'right' }}>
                                                <div className="comment-user-name">{senderDisplayName}</div>
                                                <div className="comment-text">{message.content}</div>
                                                {message.photos && Array.isArray(message.photos) && message.photos.length > 0 && (
                                                    <div className="comment-photos" style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                                        {message.photos.map((p: any, i: number) => {
                                                            const url = typeof p === 'string' ? p : (p.url || '');
                                                            return (
                                                                <img
                                                                    key={i}
                                                                    src={url}
                                                                    alt={`photo-${i}`}
                                                                    style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                                                                    onClick={() => setSelectedPhoto(url)}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <IonText style={{ color: '#b8adadff', fontWeight: '300', fontSize: 12, marginTop: 8, display: 'block', textAlign: isOwnMessage ? 'right' : 'left' }}>
                                                    {message?.address}
                                                </IonText>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

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
                <IonToast
                    position="top"
                    isOpen={toastOpen}
                    message={toastMsg}
                    onDidDismiss={() => setToastOpen(false)}
                    duration={4000}
                />
            </IonContent>
        </IonPage>
    );
}

export default Conversation;
