import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonContent, IonToolbar, IonLabel, IonAvatar, IonButton, IonIcon, IonSpinner, useIonViewWillEnter } from '@ionic/react';
import './Messages.css';
import AppHeader from '../../components/Header/AppHeader';
import InitialsCircle from '../../hooks/Helper/FormatedNameBox/NameFormatedBox';
import { api_endpoint } from '../../config/api';
import { timeAgo as _timeAgo } from '../../utils/timeAgo';
import { sendOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';

interface Message {
  id: number;
  senderId?: number;
  senderName: string;
  content: string;
  createdAt: string;
  unread?: boolean;
  isRead?: boolean;
  petId?: number | null;
  pet?: {
    name?: string;
  };
  participants?: Array<{
    id: number;
    fullname?: string;
  }>;
  lastMessage?: {
    content?: string;
  };
}



const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const colorOptions = ['#007bff', '#28a745', '#ff6600', '#6f42c1', '#17a2b8', '#103102ff', '#ff5733', '#33ff57', '#3357ff', '#ff33a8'];

  const userColorMap = useMemo(() => {
    const map: { [name: string]: string } = {};
    messages.forEach(m => {
      const name = m.senderName || 'Usuario';
      if (!map[name]) map[name] = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    });
    return map;
  }, [messages]);

   const fetchMessages = async () => {

    const token = localStorage.getItem('accessToken') || '';

    const data_user = localStorage.getItem('data_user') || '{}';
    const user = JSON.parse(data_user);
    setLoading(true);
      try { 
        const resp = await fetch(`${api_endpoint}/conversations/user/${user.id}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json' ,
             'Authorization': `Bearer ${token}`
        }       
        });
        const data = await resp.json().catch(() => ([]));   
        if (resp.ok) {
          console.log('Conversations',data);
            setMessages(data);  
        } else {
            console.warn('Failed to fetch messages, using sample data');
        }   
        } catch (err) {
        console.warn('Error fetching messages:', err);
        } finally {
        setLoading(false);
        }
      };
    //   fetchMessages();

  useIonViewWillEnter(() => {
    fetchMessages();
  });

  const timeAgo = (d?: string) => { try { return _timeAgo(d); } catch { return '' } }
  const history = useHistory();
  const { setSelectedConversation } = useContext(AuthContext) as any;

  const openConversation = (msg: Message) => {

// router.get('/:conversationId/messages', conversationController.getConversationMessages);

fetch(`${api_endpoint}/conversations/${msg.id}/messages`, {
  method: 'GET',
  headers: { 
    'Content-Type': 'application/json' ,
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
}
})
.then(res => res.json())
.then(data => {
  setSelectedConversation?.({ ...msg, messages: data });
  history.push('/tabs/messages/conversation');
})
.catch(err => {
  console.error('Error fetching conversation messages:', err);
});


  }


  const loadRecipient = (msg: Message) => {
    const data_user = localStorage.getItem('data_user') || '{}';
    const user = JSON.parse(data_user);

    console.log('MAP',msg);

      if(msg.participants){
        for(const p of msg.participants){
          if(p.id !== user.id){
            return p.fullname || 'Usuario';
          }
      //  msg.participants.foreach((p:any) => {
      //     if(p.id !== user.id){
      //       return p.fullname || 'Usuario';
      //     }
      }
    }


  }

  return (
    <IonPage>
      {/* <AppHeader /> */}
      <IonContent>
        <IonToolbar style={{ padding: 12 }}>
          <IonLabel style={{ fontWeight: 700 }}>Mensajes</IonLabel>
        </IonToolbar>

        <div className="messages-container">
         {loading && (
            <div style={{ display: 'flex',color:'blue', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <IonSpinner style={{ width: '48px', height: '48px' }} name="crescent" color="secondary" />
                <span style={{ marginLeft: 12 }}>Cargando mensajes...</span>
            </div>
            )}
          {!loading && messages.length === 0 && <div style={{ padding: 12 }}>No hay mensajes.</div>}
          {messages.map((msg, idx) => {
            const unread = (msg as any).unread === true || (msg as any).isRead === false || false;
            return (
              <button
                key={msg.id ?? `msg-${idx}`}
                onClick={() => openConversation(msg)}
                className="message-item"
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative' }}>
                  <IonAvatar style={{ width: 48, height: 48 }}>
                    <InitialsCircle fullname={loadRecipient(msg)} bgColor={userColorMap[msg.senderName]} textColor="#fff" size={48} />
                  </IonAvatar>
                  {unread && (
                    <span style={{ position: 'absolute', right: -2, top: -2, width: 10, height: 10, borderRadius: 6, background: '#2f80ed', boxShadow: '0 0 0 2px rgba(0,0,0,0.08)' }} />
                  )}
                </div>

             <div style={{ flex: 1, minWidth: 0 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontWeight: 700, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      Chat de {loadRecipient(msg)}
    </div>
    <div style={{ fontSize: 12, color: '#666', marginLeft: 12 }}>{timeAgo(msg.createdAt)}</div>
  </div>

  {/* Último mensaje */}
  <div style={{
    fontSize: 13,
    color: '#444',
    marginTop: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }}>
    {msg?.lastMessage?.content || 'Sin mensaje aún'}
  </div>
</div>
              </button>
            )
          })}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Messages;
