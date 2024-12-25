import React, { useState } from 'react';

function RelationModal({ classes, onClose, onSubmit }) {
  const [type, setType] = useState('association');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');

  const handleSubmit = () => {
    if (!source || !target) {
      alert('Source et cible sont requis.');
      return;
    }

    onSubmit({ type, source, target });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Nouvelle Relation</h2>
        <label>Type :</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {['association', 'aggregation', 'composition', 'generalization'].map(
            (relationType) => (
              <option key={relationType} value={relationType}>
                {relationType}
              </option>
            )
          )}
        </select>
        <label>Source :</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">--Sélectionnez--</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <label>Cible :</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">--Sélectionnez--</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Créer</button>
        <button onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

export default RelationModal;
