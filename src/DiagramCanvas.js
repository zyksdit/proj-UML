import React from "react";

function DiagramCanvas({
  elements,
  associations,
  setElements,
  zoom,
  onEditClass,
  onDeleteClass,
  onDeleteAssociation,
  onDragEnd,
}){
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e) => {
    const id = e.dataTransfer.getData("id");
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / zoom;
    const y = (e.clientY - canvasRect.top) / zoom;

    setElements((prev) =>
      prev.map((el) => (el.id === parseInt(id) ? { ...el, x, y } : el))
    );

    if (onDragEnd) onDragEnd(parseInt(id), x, y);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  function calculateEdgePoint(x1, y1, x2, y2, width, height) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
  
    if (absDx > absDy) {
      // Intersection avec les bords gauche ou droit
      if (dx > 0) {
        return { x: x1 + width / 2, y: y1 + (height / 2) * (dy / dx) };
      } else {
        return { x: x1 - width / 2, y: y1 - (height / 2) * (dy / dx) };
      }
    } else {
      // Intersection avec les bords haut ou bas
      if (dy > 0) {
        return { x: x1 + (width / 2) * (dx / dy), y: y1 + height / 2 };
      } else {
        return { x: x1 - (width / 2) * (dx / dy), y: y1 - height / 2 };
      }
    }
  }
  

  return (
    <div
      className="diagram-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
    <div
        className="diagram-content"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
    >
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
    {/* Flèche pleine pour unidirectionnel */}
    <marker
      id="arrowhead"
      markerWidth="5"
      markerHeight="7"
      refX="10"
      refY="3.5"
      orient="auto"
    >
    <polygon points="0 0, 10 3.5, 0 7" fill="black" />
    </marker>

    {/* Triangle vide pour généralisation */}
    <marker
      id="triangle"
      markerWidth="5"
      markerHeight="10"
      refX="10"
      refY="5"
      orient="auto"
    >
    <polygon points="0 0, 10 5, 0 10" fill="white" stroke="black" strokeWidth="1" />
    </marker>

    {/* Diamant vide pour agrégation */}
    <marker
      id="diamond"
      markerWidth="5"
      markerHeight="10"
      refX="10"
      refY="5"
      orient="auto"
    >
    <polygon points="0 5, 5 0, 10 5, 5 10" fill="white" stroke="black" strokeWidth="1" />
    </marker>

    {/* Diamant plein pour composition */}
    <marker
      id="filledDiamond"
      markerWidth="5"
      markerHeight="10"
      refX="10"
      refY="5"
      orient="auto"
    >
    <polygon points="0 5, 5 0, 10 5, 5 10" fill="black" />
    </marker>
    </defs>
    </svg>

        {/* Classes */}
        {elements.map((el) => (
          <div
            key={el.id}
            className="uml-class"
            draggable
            onDragStart={(e) => handleDragStart(e, el.id)}
            style={{ left: `${el.x}px`, top: `${el.y}px` }}
          >
            <h3>{el.name}</h3>
            <ul>
              {el.attributes.map((attr, index) => (
                <li key={index}>
                  {attr.name}: {attr.type}
                </li>
              ))}
            </ul>
            <ul>
              {el.methods.map((method, index) => (
                <li key={index}>
                  {method.name}(): {method.type}
                </li>
              ))}
            </ul>
            <button onClick={() => onEditClass(el.id)}>Edit</button>
            <button onClick={() => onDeleteClass(el.id)}>Delete</button>
          </div>
        ))}

        {/* Associations */}
        {associations.map((assoc) => {
            const classWidth = 200; // Largeur approximative des classes UML
            const classHeight = 100; // Hauteur approximative des classes UML            
            const source = elements.find((el) => String(el.id) === String(assoc.sourceId));
            const target = elements.find((el) => String(el.id) === String(assoc.targetId));

            if (!source || !target) return null;

            // Centre des classes
            const sourceCenterX = source.x + classWidth / 2;
            const sourceCenterY = source.y + classHeight / 2;
            const targetCenterX = target.x + classWidth / 2;
            const targetCenterY = target.y + classHeight / 2;

// Points d'intersection avec les bords
            const { x: x1, y: y1 } = calculateEdgePoint(
                sourceCenterX,
                sourceCenterY,
                targetCenterX,
                targetCenterY,
                classWidth,
                classHeight
            );
            const { x: x2, y: y2 } = calculateEdgePoint(
                targetCenterX,
                targetCenterY,
                sourceCenterX,
                sourceCenterY,
                classWidth,
                classHeight
              );
  // Détermine le style de l'association en fonction de son type
            let lineStyle = { stroke: "black", strokeWidth: 2, strokeDasharray: "" };
            let marker = "arrowhead"; // Par défaut : flèche pleine

            switch (assoc.type) {
            case "unidirectional":
            marker = "arrowhead";
            break;
            case "bidirectional":
            marker = "arrowhead"; // Ajoute des flèches des deux côtés si nécessaire
            break;
            case "aggregation":
            marker = "diamond"; // Diamant vide pour l'agrégation
            break;
            case "composition":
            marker = "filledDiamond"; // Diamant plein pour la composition
            break;
            case "generalization":
            marker = "triangle"; // Triangle pour la généralisation
            break;
            case "dependency":
            lineStyle.strokeDasharray = "5,5"; // Ligne pointillée pour la dépendance
            marker = "arrowhead";
            break;
            default:
            marker = "arrowhead"; // Flèche pleine par défaut
        }

    return (
        <svg
        key={assoc.id}
        style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        }}
        >
        {/* Ligne d'association */}
        <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={lineStyle}
        markerEnd={`url(#${marker})`}
        />
        {/* Multiplicités */}
        <text x={x1 - 10} y={y1 - 10} style={{ fill: "black", fontSize: "12px" }}>
        {assoc.sourceMultiplicity}
        </text>
        <text x={x2 + 10} y={y2 - 10} style={{ fill: "black", fontSize: "12px" }}>
        {assoc.targetMultiplicity}
        </text>
        </svg>
    );
    })}
      </div>
    </div>
  );
}

export default DiagramCanvas;
