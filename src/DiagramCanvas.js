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
}) {
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

        {associations.map((assoc) => {
          const source = elements.find((el) => el.id === assoc.sourceId);
          const target = elements.find((el) => el.id === assoc.targetId);

          if (!source || !target) return null;

          const x1 = source.x + 100;
          const y1 = source.y + 50;
          const x2 = target.x + 100;
          const y2 = target.y + 50;

          return (
            <svg
              key={assoc.id}
              className="association-line"
              style={{ position: "absolute", left: 0, top: 0 }}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="2"
              />
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 5}
                style={{ fill: "black", fontSize: "12px" }}
              >
                {assoc.type}
              </text>
              <circle
                cx={x1}
                cy={y1}
                r="5"
                fill="red"
                onClick={() => onDeleteAssociation(assoc.id)}
                style={{ cursor: "pointer" }}
              />
            </svg>
          );
        })}
      </div>
    </div>
  );
}

export default DiagramCanvas;
