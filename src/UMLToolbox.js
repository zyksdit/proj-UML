import React from "react";

function UMLToolbox({
  onAddClass,
  onZoom,
  onSave,
  onLoad,
  onGenerateCode,
  onAddAssociation,
}) {
  return (
    <div className="toolbox">
      <button onClick={onAddClass}>Add Class</button>
      <button onClick={() => onZoom(1)}>Zoom In</button>
      <button onClick={() => onZoom(-1)}>Zoom Out</button>
      <button onClick={onSave}>Save Diagram</button>
      <button onClick={onLoad}>Load Diagram</button>
      <button onClick={() => onGenerateCode("Java")}>Generate Java Code</button>
      <button onClick={() => onGenerateCode("PHP")}>Generate PHP Code</button>
      <button onClick={() => onGenerateCode("Python")}>Generate Python Code</button>
      <button onClick={onAddAssociation}>Add Association</button> {/* Nouveau bouton */}
    </div>
  );
}

export default UMLToolbox;
