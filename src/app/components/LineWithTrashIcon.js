import React, { useState } from "react";
import { Group, Circle, Rect, Image, Line } from "react-konva";
import useImage from "use-image";

const LineWithTrashIcon = ({
  index,
  line,
  setLines,
  calculateLinePoints,
  handleLineClick,
  isPointInBox,
  isItemInBox,
  images,
  selectionBoxes,
}) => {
  const [isTrashHovered, setIsTrashHovered] = useState(false);

  const [trashIcon] = useImage("/trashcan.svg"); // 替換為實際的垃圾桶圖示路徑
  const [trashDarkIcon] = useImage("/trashcanDark.svg"); // 替換為實際的垃圾桶圖示路徑

  // 計算中間點
  const points = calculateLinePoints(line.start, line.end, line.isStraight);
  const midX = (points[0] + points[2]) / 2; // 中間點 X
  const midY = (points[1] + points[3]) / 2; // 中間點 Y

  const [hoveredLineIndex, setHoveredLineIndex] = useState(null); // 用於追蹤 hover 狀態的線

  const handleDeleteLine = (index) => {
    setLines((prevLines) => prevLines.filter((_, i) => i !== index));
  };

  // 拖動起始點
  const handleDragStartPoint = (e, lineIndex) => {
    const { x, y } = e.target.position();
    // console.log("Dragging start point:", x, y);

    setLines((prevLines) =>
      prevLines.map((line, idx) =>
        idx === lineIndex
          ? updateLineConnection(
              { ...line, start: { x: x - 50, y: y - 50 } },
              images,
              selectionBoxes
            )
          : line
      )
    );
  };

  // console.log(images);
  // console.log(selectionBoxes);

  // 拖動終點
  const handleDragEndPoint = (e, lineIndex) => {
    const { x, y } = e.target.position();

    setLines((prevLines) =>
      prevLines.map((line, idx) =>
        idx === lineIndex
          ? updateLineConnection(
              { ...line, end: { x: x - 50, y: y - 50 } },
              images,
              selectionBoxes
            )
          : line
      )
    );
  };

  const updateLineConnection = (line, images, boxes) => {
    let connectedStart = null;
    let connectedEnd = null;
    images.forEach((image) => {
      const width = image.width || 100; // 動態獲取圖片寬度，默認 100
      const height = image.height || 100; // 動態獲取圖片高度，默認 100
      if (
        isPointInBox(
          { x: line.start.x + 50, y: line.start.y + 50 },
          image,
          width,
          height
        )
      ) {
        connectedStart = {
          x: image.x + width / 2 - 50,
          y: image.y + height / 2 - 50,
        };
      }

      if (
        isPointInBox(
          { x: line.end.x + 50, y: line.end.y + 50 },
          image,
          width,
          height
        )
      ) {
        connectedEnd = {
          x: image.x + width / 2 - 50,
          y: image.y + height / 2 - 50,
        };
      }
    });

    return {
      ...line,
      start: connectedStart || line.start,
      end: connectedEnd || line.end,
    };
  };

  return (
    <Group key={index}>
      {/* 線條 */}
      <Line
        points={points}
        stroke={hoveredLineIndex === index ? "#666" : line.color}
        strokeWidth={3}
        hitStrokeWidth={25}
        tension={0.01}
        onClick={() => handleLineClick(index)}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "pointer"; // 顯示手形
          setHoveredLineIndex(index);
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "default"; // 恢復預設鼠標
          setHoveredLineIndex(null);
        }}
      />

      {/* 起點節點 */}
      <Circle
        x={line.start.x + 50}
        y={line.start.y + 50}
        radius={7}
        fill="#3498db"
        draggable
        onDragMove={(e) => handleDragStartPoint(e, index)}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "default";
        }}
      />

      {/* 終點節點 */}
      <Circle
        x={line.end.x + 50}
        y={line.end.y + 50}
        radius={7}
        fill="#3498db"
        draggable
        onDragMove={(e) => handleDragEndPoint(e, index)}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "move"; // 顯示拖曳游標
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          stage.container().style.cursor = "default"; // 恢復預設游標
        }}
      />

      {/* 中間點垃圾桶圖示 */}
      {hoveredLineIndex === index && (
        <Group>
          {/* 擴大 hover 範圍的透明矩形 */}
          <Rect
            x={midX - 15}
            y={midY - 15}
            width={30}
            height={30}
            fill="transparent"
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "pointer";
              setHoveredLineIndex(index);
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "default";
              setHoveredLineIndex(null);
            }}
            onClick={(e) => {
              e.cancelBubble = true; // 阻止冒泡
              handleDeleteLine(index);
            }}
          />
          {/* 真實垃圾桶圖示 */}
          <Image
            x={midX - 10}
            y={midY - 10}
            width={20}
            height={20}
            fill={"#fff"}
            image={isTrashHovered ? trashDarkIcon : trashIcon}
            onClick={(e) => {
              e.cancelBubble = true; // 阻止冒泡
              handleDeleteLine(index);
              const stage = e.target.getStage();
              stage.container().style.cursor = "default";
            }}
            onMouseEnter={(e) => {
              setIsTrashHovered(true);
              const stage = e.target.getStage();
              stage.container().style.cursor = "pointer";
              setHoveredLineIndex(index);
            }}
            onMouseLeave={(e) => {
              setIsTrashHovered(false);
              const stage = e.target.getStage();
              stage.container().style.cursor = "default";
              setHoveredLineIndex(null);
            }}
          />
        </Group>
      )}
    </Group>
  );
};

export default LineWithTrashIcon;
