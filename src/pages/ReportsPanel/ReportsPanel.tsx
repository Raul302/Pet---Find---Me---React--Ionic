import { 
  IonContent, 
  IonPage, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonLabel,
  IonModal,
  IonInput,
  IonTextarea,
  IonAvatar,
  IonItem,
  IonList,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { useState } from 'react';
import { 
  checkmarkCircleOutline, 
  closeCircleOutline, 
  createOutline, 
  trashOutline,
  filterOutline,
  calendarOutline,
  locationOutline,
  pawOutline
} from 'ionicons/icons';
import AppHeader from '../../components/Header/AppHeader';
import './ReportsPanel.css';

interface Report {
  id: number;
  petName: string;
  species: string;
  description: string;
  location: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reporterName: string;
  reporterContact: string;
  photo: string;
  type: 'lost' | 'found';
}

const ReportsPanel: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchText, setSearchText] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editedReport, setEditedReport] = useState<Report | null>(null);

  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      petName: 'Max',
      species: 'Perro',
      description: 'Labrador dorado, muy amigable',
      location: 'Colonia Centro, CDMX',
      date: '2025-11-25',
      status: 'pending',
      reporterName: 'Juan Pérez',
      reporterContact: 'juan@email.com',
      photo: 'https://placedog.net/400/300?id=10',
      type: 'lost'
    },
    {
      id: 2,
      petName: 'Luna',
      species: 'Gato',
      description: 'Gata gris con collar rosa',
      location: 'Guadalajara, Jalisco',
      date: '2025-11-24',
      status: 'pending',
      reporterName: 'María González',
      reporterContact: 'maria@email.com',
      photo: 'https://placekitten.com/400/300',
      type: 'found'
    },
    {
      id: 3,
      petName: 'Rocky',
      species: 'Perro',
      description: 'Pitbull color café con manchas',
      location: 'Monterrey, Nuevo León',
      date: '2025-11-23',
      status: 'approved',
      reporterName: 'Carlos Ramírez',
      reporterContact: 'carlos@email.com',
      photo: 'https://placedog.net/400/300?id=11',
      type: 'lost'
    },
    {
      id: 4,
      petName: 'Michi',
      species: 'Gato',
      description: 'Gato naranja, sin collar',
      location: 'Puebla, Puebla',
      date: '2025-11-22',
      status: 'rejected',
      reporterName: 'Ana Torres',
      reporterContact: 'ana@email.com',
      photo: 'https://placekitten.com/401/300',
      type: 'found'
    },
    {
      id: 5,
      petName: 'Toby',
      species: 'Perro',
      description: 'Chihuahua beige, muy pequeño',
      location: 'Querétaro, Querétaro',
      date: '2025-11-26',
      status: 'pending',
      reporterName: 'Luis Hernández',
      reporterContact: 'luis@email.com',
      photo: 'https://placedog.net/400/300?id=12',
      type: 'lost'
    }
  ]);

  const handleApprove = (reportId: number) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'approved' as const } : report
    ));
  };

  const handleReject = (reportId: number) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'rejected' as const } : report
    ));
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setEditedReport({ ...report });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editedReport) {
      setReports(reports.map(report => 
        report.id === editedReport.id ? editedReport : report
      ));
      setShowEditModal(false);
      setSelectedReport(null);
      setEditedReport(null);
    }
  };

  const handleDelete = (reportId: number) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = report.status === selectedStatus;
    const matchesSearch = report.petName.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesSpecies = filterSpecies === 'all' || report.species === filterSpecies;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesStatus && matchesSearch && matchesSpecies && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    return type === 'lost' ? 'Perdido' : 'Encontrado';
  };

  return (
    <IonPage>
      <AppHeader />
      <IonContent fullscreen className="reports-panel-content">
        <div className="reports-panel-container">
          {/* Header */}
          <div className="panel-header">
            <h1 className="panel-title">Panel de Reportes de Mascotas</h1>
            <IonBadge color="primary" className="reports-count">
              {filteredReports.length} reportes
            </IonBadge>
          </div>

          {/* Status Tabs */}
          <IonSegment 
            value={selectedStatus} 
            onIonChange={e => setSelectedStatus(e.detail.value as string)}
            className="status-segment"
          >
            <IonSegmentButton value="pending">
              <IonLabel>Pendientes</IonLabel>
              <IonBadge color="warning">{reports.filter(r => r.status === 'pending').length}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="approved">
              <IonLabel>Aprobados</IonLabel>
              <IonBadge color="success">{reports.filter(r => r.status === 'approved').length}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="rejected">
              <IonLabel>Rechazados</IonLabel>
              <IonBadge color="danger">{reports.filter(r => r.status === 'rejected').length}</IonBadge>
            </IonSegmentButton>
          </IonSegment>

          {/* Filters */}
          <div className="filters-section">
            <IonSearchbar
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              placeholder="Buscar por nombre, descripción o ubicación..."
              className="search-reports"
            />
            
            <div className="filter-row">
              <IonSelect
                value={filterSpecies}
                placeholder="Especie"
                onIonChange={e => setFilterSpecies(e.detail.value)}
                interface="popover"
                className="filter-select"
              >
                <IonSelectOption value="all">Todas las especies</IonSelectOption>
                <IonSelectOption value="Perro">Perro</IonSelectOption>
                <IonSelectOption value="Gato">Gato</IonSelectOption>
                <IonSelectOption value="Ave">Ave</IonSelectOption>
                <IonSelectOption value="Otro">Otro</IonSelectOption>
              </IonSelect>

              <IonSelect
                value={filterType}
                placeholder="Tipo"
                onIonChange={e => setFilterType(e.detail.value)}
                interface="popover"
                className="filter-select"
              >
                <IonSelectOption value="all">Todos</IonSelectOption>
                <IonSelectOption value="lost">Perdidos</IonSelectOption>
                <IonSelectOption value="found">Encontrados</IonSelectOption>
              </IonSelect>
            </div>
          </div>

          {/* Reports List */}
          <div className="reports-list">
            {filteredReports.length === 0 ? (
              <div className="no-reports">
                <IonIcon icon={pawOutline} className="no-reports-icon" />
                <p>No hay reportes {getStatusText(selectedStatus).toLowerCase()}</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <IonCard key={report.id} className="report-card">
                  <div className="report-card-content">
                    <div className="report-image-container">
                      <img src={report.photo} alt={report.petName} className="report-image" />
                      <IonChip className={report.type === 'lost' ? 'reported-lost type-chip' : 'reported-found type-chip'} >
                        {getTypeText(report.type)}
                      </IonChip>
                    </div>

                    <div className="report-details">
                      <div className="report-header-row">
                        <h2 className="report-pet-name">{report.petName}</h2>
                        <IonBadge color={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </IonBadge>
                      </div>

                      <div className="report-info-row">
                        <IonChip className="info-chip">
                          <IonIcon icon={pawOutline} />
                          <IonLabel>{report.species}</IonLabel>
                        </IonChip>
                        <IonChip className="info-chip">
                          <IonIcon icon={calendarOutline} />
                          <IonLabel>{new Date(report.date).toLocaleDateString('es-MX')}</IonLabel>
                        </IonChip>
                      </div>

                      <p className="report-description">{report.description}</p>

                      <div className="report-meta">
                        <div className="meta-item">
                          <IonIcon icon={locationOutline} />
                          <span>{report.location}</span>
                        </div>
                        <div className="meta-item">
                          <strong>Reportado por:</strong> {report.reporterName}
                        </div>
                        <div className="meta-item">
                          <strong>Contacto:</strong> {report.reporterContact}
                        </div>
                      </div>

                      <div className="report-actions">
                        {report.status === 'pending' && (
                          <>
                            <IonButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleApprove(report.id)}
                            >
                              <IonIcon slot="start" icon={checkmarkCircleOutline} />
                              Aprobar
                            </IonButton>
                            <IonButton 
                              size="small" 
                              color="danger" 
                              onClick={() => handleReject(report.id)}
                            >
                              <IonIcon slot="start" icon={closeCircleOutline} />
                              Rechazar
                            </IonButton>
                          </>
                        )}
                        <IonButton 
                          size="small" 
                          color="tertiary" 
                          fill="outline"
                          onClick={() => handleEdit(report)}
                        >
                          <IonIcon slot="start" icon={createOutline} />
                          Editar
                        </IonButton>
                        <IonButton 
                          size="small" 
                          color="danger" 
                          fill="outline"
                          onClick={() => handleDelete(report.id)}
                        >
                          <IonIcon slot="start" icon={trashOutline} />
                          Eliminar
                        </IonButton>
                      </div>
                    </div>
                  </div>
                </IonCard>
              ))
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonPage>
            <AppHeader />
            <IonContent className="edit-modal-content">
              <div className="edit-modal-container">
                <h2 className="modal-title">Editar Reporte</h2>
                
                {editedReport && (
                  <IonList className="edit-form">
                    <IonItem>
                      <IonLabel position="stacked">Nombre de la mascota</IonLabel>
                      <IonInput
                        value={editedReport.petName}
                        onIonInput={e => setEditedReport({...editedReport, petName: e.detail.value || ''})}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Especie</IonLabel>
                      <IonSelect
                        value={editedReport.species}
                        onIonChange={e => setEditedReport({...editedReport, species: e.detail.value})}
                      >
                        <IonSelectOption value="Perro">Perro</IonSelectOption>
                        <IonSelectOption value="Gato">Gato</IonSelectOption>
                        <IonSelectOption value="Ave">Ave</IonSelectOption>
                        <IonSelectOption value="Otro">Otro</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Tipo</IonLabel>
                      <IonSelect
                        value={editedReport.type}
                        onIonChange={e => setEditedReport({...editedReport, type: e.detail.value})}
                      >
                        <IonSelectOption value="lost">Perdido</IonSelectOption>
                        <IonSelectOption value="found">Encontrado</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Descripción</IonLabel>
                      <IonTextarea
                        value={editedReport.description}
                        onIonInput={e => setEditedReport({...editedReport, description: e.detail.value || ''})}
                        rows={4}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Ubicación</IonLabel>
                      <IonInput
                        value={editedReport.location}
                        onIonInput={e => setEditedReport({...editedReport, location: e.detail.value || ''})}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Nombre del reportador</IonLabel>
                      <IonInput
                        value={editedReport.reporterName}
                        onIonInput={e => setEditedReport({...editedReport, reporterName: e.detail.value || ''})}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Contacto</IonLabel>
                      <IonInput
                        value={editedReport.reporterContact}
                        onIonInput={e => setEditedReport({...editedReport, reporterContact: e.detail.value || ''})}
                      />
                    </IonItem>
                  </IonList>
                )}

                <div className="modal-actions">
                  <IonButton expand="block" onClick={handleSaveEdit} color="primary">
                    Guardar Cambios
                  </IonButton>
                  <IonButton expand="block" onClick={() => setShowEditModal(false)} fill="outline">
                    Cancelar
                  </IonButton>
                </div>
              </div>
            </IonContent>
          </IonPage>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ReportsPanel;
