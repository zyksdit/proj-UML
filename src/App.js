import React, { useState } from "react";
import "./App.css";
import DiagramCanvas from "./DiagramCanvas";
import UMLToolbox from "./UMLToolbox";

const TYPE_OPTIONS = ["int", "float", "string", "boolean", "date"]; 


function App() {
  const [elements, setElements] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAssociationModal, setShowAssociationModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [associationType, setAssociationType] = useState("unidirectional");
  const [sourceMultiplicity, setSourceMultiplicity] = useState("1");
  const [targetMultiplicity, setTargetMultiplicity] = useState("1");
  const [newClassData, setNewClassData] = useState({
    name: "",
    attributes: [],
    methods: [],
  });

  const handleAddClass = () => {
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditClass = (classId) => {
    const classToEdit = elements.find((el) => el.id === classId);
    if (classToEdit) {
      setEditMode(true);
      setCurrentClassId(classId);
      setNewClassData({
        name: classToEdit.name,
        attributes: [...classToEdit.attributes],
        methods: [...classToEdit.methods],
      });
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentClassId(null);
    setNewClassData({ name: "", attributes: [], methods: [] });
  };

  const handleAddClassSubmit = () => {
    if (newClassData.name.trim()) {
      if (editMode) {
        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === currentClassId
              ? {
                  ...el,
                  name: newClassData.name,
                  attributes: [...newClassData.attributes],
                  methods: [...newClassData.methods],
                }
              : el
          )
        );
      } else {
        setElements([
          ...elements,
          {
            id: Date.now(),
            type: "class",
            name: newClassData.name,
            x: 100 + elements.length * 20,
            y: 100 + elements.length * 20,
            attributes: [...newClassData.attributes],
            methods: [...newClassData.methods],
          },
        ]);
      }
      handleCloseModal();
    } else {
      alert("Class name is required.");
    }
  };

  const handleDeleteClass = (classId) => {
    setElements((prevElements) =>
      prevElements.filter((el) => el.id !== classId)
    );
    setAssociations((prevAssociations) =>
      prevAssociations.filter(
        (assoc) => assoc.sourceId !== classId && assoc.targetId !== classId
      )
    );
  };

  const handleFieldChange = (field, index, key, value) => {
    const updatedField = [...newClassData[field]];
    updatedField[index][key] = value;
    setNewClassData({ ...newClassData, [field]: updatedField });
  };
  
  const handleAddField = (field) => {
    setNewClassData({
      ...newClassData,
      [field]: [...newClassData[field], { name: "", type: TYPE_OPTIONS[0] }],
    });
  };
  
  const handleAddMethodField = () => {
    const classTypeOptions = elements.map((el) => el.name); // Récupérer les noms des classes existantes
    const dynamicTypeOptions = [...TYPE_OPTIONS, ...classTypeOptions]; // Fusionner les types disponibles
  
    setNewClassData({
      ...newClassData,
      methods: [
        ...newClassData.methods,
        { name: "", type: dynamicTypeOptions[0] }, // Par défaut, sélectionner le premier type
      ],
    });
  };
  

  const handleRemoveField = (field, index) => {
    setNewClassData({
      ...newClassData,
      [field]: newClassData[field].filter((_, i) => i !== index),
    });
  };

  const handleZoom = (direction) => {
    setZoom((prevZoom) => Math.max(0.5, prevZoom + direction * 0.1));
  };

  const handleSaveDiagram = () => {
    try {
      const diagramData = JSON.stringify({ elements, associations });
      localStorage.setItem("umlDiagram", diagramData);
      alert("Diagram saved successfully.");
    } catch (error) {
      console.error("Failed to save diagram:", error);
      alert("An error occurred while saving the diagram.");
    }
  };

  const handleLoadDiagram = () => {
    try {
      const savedDiagram = localStorage.getItem("umlDiagram");
      if (!savedDiagram) {
        alert("No saved diagram found.");
        return;
      }

      const parsedDiagram = JSON.parse(savedDiagram);
      if (!parsedDiagram.elements || !parsedDiagram.associations) {
        throw new Error("Invalid diagram data format.");
      }

      setElements(parsedDiagram.elements);
      setAssociations(parsedDiagram.associations);
      alert("Diagram loaded successfully.");
    } catch (error) {
      console.error("Failed to load diagram:", error);
      alert("An error occurred while loading the diagram. Ensure the saved data is valid.");
    }
  };

  const handleAddAssociation = () => {
    if (!selectedSourceId || !selectedTargetId) {
      alert("Both source and target classes must be selected.");
      return;
    }

    const newAssociation = {
      id: Date.now(),
      sourceId: selectedSourceId,
      targetId: selectedTargetId,
      type: associationType,
      sourceMultiplicity,
      targetMultiplicity,
    };

    setAssociations((prev) => [...prev, newAssociation]);
    setShowAssociationModal(false);
  };

  const handleDeleteAssociation = (associationId) => {
    setAssociations((prev) => prev.filter((assoc) => assoc.id !== associationId));
  };
  const handleGenerateCode = (language) => {
    if (elements.length === 0) {
      alert("No classes available to generate code.");
      return;
    }
  
    const code = elements
      .map((el) => {
        const className = el.name.charAt(0).toUpperCase() + el.name.slice(1);
  
        if (language === "Java") {
          const attributes = el.attributes
            .map((attr) => `    private ${attr.type} ${attr.name};`)
            .join("\n");
  
          const methods = el.methods
            .map(
              (method) =>
                `    public ${method.type} ${method.name}() {\n        // TODO: Implement\n    }`
            )
            .join("\n");
  
          return `public class ${className} {\n${attributes}\n\n${methods}\n}`;
        } else if (language === "PHP") {
          const attributes = el.attributes
            .map((attr) => `    private $${attr.name};`)
            .join("\n");
  
          const methods = el.methods
            .map(
              (method) =>
                `    public function ${method.name}() {\n        // TODO: Implement\n    }`
            )
            .join("\n");
  
          return `class ${className} {\n${attributes}\n\n${methods}\n}`;
        } else if (language === "Python") {
          const attributes = el.attributes
            .map((attr) => `        self.${attr.name} = None  # Type: ${attr.type}`)
            .join("\n");
  
          const methods = el.methods
            .map(
              (method) =>
                `    def ${method.name}(self):\n        # TODO: Implement\n        pass`
            )
            .join("\n");
  
          return `class ${className}:\n    def __init__(self):\n${attributes}\n\n${methods}\n`;
        }
        return "";
      })
      .join("\n\n");
  
    alert(`Generated ${language} code:\n\n${code}`);
  };


  return (
    <div className="container">
      <header>
        <h1>UML Class Diagram Tool</h1>
      </header>
      <UMLToolbox
        onAddClass={handleAddClass}
        onZoom={handleZoom}
        onSave={handleSaveDiagram}
        onLoad={handleLoadDiagram}
        onGenerateCode={handleGenerateCode} // Connecter la fonction ici
        onAddAssociation={() => setShowAssociationModal(true)}
      />

      <DiagramCanvas
        elements={elements}
        associations={associations}
        setElements={setElements}
        zoom={zoom}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
        onDeleteAssociation={handleDeleteAssociation}
      />
      {showModal && (
  <div className="modal">
    <div className="modal-content">
      <h2>{editMode ? "Edit Class" : "Create Class"}</h2>
      <label>
        Class Name:
        <input
          type="text"
          value={newClassData.name}
          onChange={(e) =>
            setNewClassData({ ...newClassData, name: e.target.value })
          }
        />
      </label>
      <div className="scrollable-content">
        <h3>Attributes</h3>
        {newClassData.attributes.map((attr, index) => (
          <div key={index} className="field-row">
            <input
              type="text"
              placeholder="Attribute Name"
              value={attr.name}
              onChange={(e) =>
                handleFieldChange("attributes", index, "name", e.target.value)
              }
            />
            <select
              value={attr.type}
              onChange={(e) =>
                handleFieldChange("attributes", index, "type", e.target.value)
              }
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button onClick={() => handleRemoveField("attributes", index)}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => handleAddField("attributes")}>
          Add Attribute
        </button>
        <h3>Methods</h3>
        <h3>Methods</h3>
        {newClassData.methods.map((method, index) => (
            <div key={index} className="field-row">
              <input
                type="text"
                placeholder="Method Name"
                value={method.name}
                onChange={(e) =>
                handleFieldChange("methods", index, "name", e.target.value)
                }
              />
              <select
                value={method.type}
                onChange={(e) =>
                handleFieldChange("methods", index, "type", e.target.value)
                }
              >
                {[...TYPE_OPTIONS, ...elements.map((el) => el.name)].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
                ))}
              </select>
              <button onClick={() => handleRemoveField("methods", index)}>Remove</button>
            </div>
        ))}

        <button onClick={handleAddMethodField}>
          Add Method
        </button>

      </div>
      <div className="modal-actions">
        <button onClick={handleAddClassSubmit}>Save</button>
        <button onClick={handleCloseModal}>Cancel</button>
      </div>
    </div>
  </div>
)}

      {showAssociationModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Association</h2>
            <div style={{ marginBottom: "15px" }}>
              <strong>Source Class:</strong>
              <select
                onChange={(e) => setSelectedSourceId(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="">Select</option>
                {elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Target Class:</strong>
              <select
                onChange={(e) => setSelectedTargetId(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="">Select</option>
                {elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Association Type:</strong>
              <select
                onChange={(e) => setAssociationType(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="unidirectional">Unidirectional</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="aggregation">Aggregation</option>
                <option value="composition">Composition</option>
                <option value="generalization">Generalization</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Source Multiplicity:</strong>
              <select
                onChange={(e) =>
                  e.target.value === "custom"
                    ? setSourceMultiplicity("")
                    : setSourceMultiplicity(e.target.value)
                }
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="1">1</option>
                <option value="0..1">0..1</option>
                <option value="1..n">1..n</option>
                <option value="*">* (many)</option>
                <option value="custom">Custom</option>
              </select>
              {sourceMultiplicity === "" && (
                <input
                  type="text"
                  placeholder="Custom multiplicity (e.g., 5..n)"
                  onChange={(e) => setSourceMultiplicity(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Target Multiplicity:</strong>
              <select
                onChange={(e) =>
                  e.target.value === "custom"
                    ? setTargetMultiplicity("")
                    : setTargetMultiplicity(e.target.value)
                }
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <option value="1">1</option>
                <option value="0..1">0..1</option>
                <option value="1..n">1..n</option>
                <option value="*">* (many)</option>
                <option value="custom">Custom</option>
              </select>
              {targetMultiplicity === "" && (
                <input
                  type="text"
                  placeholder="Custom multiplicity (e.g., 5..n)"
                  onChange={(e) => setTargetMultiplicity(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleAddAssociation}
                style={{ marginRight: "10px" }}
              >
                Add
              </button>
              <button onClick={() => setShowAssociationModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;