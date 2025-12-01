import React, { useState } from 'react';
import './ReportsPanel.css';

const initialReports = [
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
];

function ReportsPanel() {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchText, setSearchText] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editedReport, setEditedReport] = useState(null);
  const [reports, setReports] = useState(initialReports);

  const handleApprove = (reportId) => {
    setReports(reports.map(report =>
      report.id === reportId ? { ...report, status: 'approved' } : report
    ));
  };

  const handleReject = (reportId) => {
    setReports(reports.map(report =>
      report.id === reportId ? { ...report, status: 'rejected' } : report
    ));
  };

  const handleEdit = (report) => {
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

  const handleDelete = (reportId) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = report.status === selectedStatus;
    const q = searchText.trim().toLowerCase();
    const matchesSearch = !q || report.petName.toLowerCase().includes(q) ||
      report.description.toLowerCase().includes(q) || report.location.toLowerCase().includes(q);
    const matchesSpecies = filterSpecies === 'all' || report.species === filterSpecies;
    const matchesType = filterType === 'all' || report.type === filterType;

    return matchesStatus && matchesSearch && matchesSpecies && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getTypeText = (type) => type === 'lost' ? 'Perdido' : 'Encontrado';

  return (
    <div className="reports-panel">
      <header className="panel-header">
        <h1>Panel de Reportes de Mascotas</h1>
        <div className="reports-count">{filteredReports.length} reportes</div>
      </header>

      <div className="controls">
        <div className="status-tabs">
          <button className={selectedStatus === 'pending' ? 'active' : ''} onClick={() => setSelectedStatus('pending')}>Pendientes</button>
          <button className={selectedStatus === 'approved' ? 'active' : ''} onClick={() => setSelectedStatus('approved')}>Aprobados</button>
          <button className={selectedStatus === 'rejected' ? 'active' : ''} onClick={() => setSelectedStatus('rejected')}>Rechazados</button>
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="Buscar por nombre, descripción o ubicación..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
          />

          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}>
            <option value="all">Todas las especies</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave</option>
            <option value="Otro">Otro</option>
          </select>

          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todos</option>
            <option value="lost">Perdidos</option>
            <option value="found">Encontrados</option>
          </select>
        </div>
      </div>

      <main className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <div className="no-reports-icon">🐾</div>
            <p>No hay reportes {getStatusText(selectedStatus).toLowerCase()}</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <article key={report.id} className="report-card">
              <div className="report-image-container">
                <img src={report.photo} alt={report.petName} className="report-image" />
                <div className={`type-chip ${report.type === 'lost' ? 'lost' : 'found'}`}>{getTypeText(report.type)}</div>
              </div>

              <div className="report-details">
                <div className="report-header-row">
                  <h2 className="report-pet-name">{report.petName}</h2>
                  <div className="badge" style={{ background: getStatusColor(report.status) }}>{getStatusText(report.status)}</div>
                </div>

                <div className="report-info-row">
                  <div className="info-chip">{report.species}</div>
                  <div className="info-chip">{new Date(report.date).toLocaleDateString('es-MX')}</div>
                </div>

                <p className="report-description">{report.description}</p>

                <div className="report-meta">
                  <div><strong>Ubicación:</strong> {report.location}</div>
                  <div><strong>Reportado por:</strong> {report.reporterName}</div>
                  <div><strong>Contacto:</strong> {report.reporterContact}</div>
                </div>

                <div className="report-actions">
                  {report.status === 'pending' && (
                    <>
                      <button className="btn small success" onClick={() => handleApprove(report.id)}>Aprobar</button>
                      <button className="btn small danger" onClick={() => handleReject(report.id)}>Rechazar</button>
                    </>
                  )}

                  <button className="btn small outline" onClick={() => handleEdit(report)}>Editar</button>
                  <button className="btn small danger outline" onClick={() => handleDelete(report.id)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))
        )}
      </main>

      {showEditModal && editedReport && (
        <div className="modal-overlay">
          <div className="modal white-box">
            <h3>Editar Reporte</h3>
            <div className="edit-form">
              <label>Nombre de la mascota</label>
              <input value={editedReport.petName} onChange={e => setEditedReport({...editedReport, petName: e.target.value})} />

              <label>Especie</label>
              <select value={editedReport.species} onChange={e => setEditedReport({...editedReport, species: e.target.value})}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Otro">Otro</option>
              </select>

              <label>Tipo</label>
              <select value={editedReport.type} onChange={e => setEditedReport({...editedReport, type: e.target.value})}>
                <option value="lost">Perdido</option>
                <option value="found">Encontrado</option>
              </select>

              <label>Descripción</label>
              <textarea value={editedReport.description} onChange={e => setEditedReport({...editedReport, description: e.target.value})} rows={4} />

              <label>Ubicación</label>
              <input value={editedReport.location} onChange={e => setEditedReport({...editedReport, location: e.target.value})} />

              <label>Nombre del reportador</label>
              <input value={editedReport.reporterName} onChange={e => setEditedReport({...editedReport, reporterName: e.target.value})} />

              <label>Contacto</label>
              <input value={editedReport.reporterContact} onChange={e => setEditedReport({...editedReport, reporterContact: e.target.value})} />

              <div className="modal-actions">
                <button className="btn primary" onClick={handleSaveEdit}>Guardar Cambios</button>
                <button className="btn outline" onClick={() => { setShowEditModal(false); setEditedReport(null); }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPanel;
