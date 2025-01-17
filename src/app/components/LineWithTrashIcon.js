import React, { useState } from "react";
import { Group, Rect, Image, Line } from "react-konva";
import useImage from "use-image";

const LineWithTrashIcon = ({
  index,
  line,
  setLines,
  calculateLinePoints,
  handleLineClick,
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
