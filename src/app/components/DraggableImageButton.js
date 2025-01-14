"use client";
import React, { useState } from "react";
import { Group, Image, Rect, Text } from "react-konva";
import useImage from "use-image";

const DraggableImageButton = ({
  x,
  y,
  src,
  hoverSrc,
  selectedSrc,
  onDragMove,
  onClick,
  onDblClick,
  isSelected,
  type,
  name,
  onCancel, // 新增刪除事件回調
}) => {
  const [image] = useImage(src);
  const [hoverImage] = useImage(hoverSrc);
  const [selectedImage] = useImage(selectedSrc);
  const [hover, setHover] = useState(false);

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragMove={(e) => {
        const stage = e.target.getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // 圖片大小
        const groupWidth = 100;
        const groupHeight = 130; // 100(圖片) + 30(文字預留)

        const newX = e.target.x();
        const newY = e.target.y();

        // 限制移動範圍
        const constrainedX = Math.max(
          0,
          Math.min(newX, stageWidth - groupWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, stageHeight - groupHeight)
        );

        e.target.x(constrainedX);
        e.target.y(constrainedY);

        onDragMove({ x: constrainedX, y: constrainedY });
      }}
      onClick={onClick}
      onDblClick={onDblClick}
    >
      {/* 主圖片 */}
      <Image
        image={
          isSelected
            ? selectedImage || image
            : hover
            ? hoverImage || image
            : image
        }
        width={100}
        height={100}
        onMouseEnter={(e) => {
          setHover(true);
          const stage = e.target.getStage();
          stage.container().style.cursor = "pointer"; // 設定鼠標為手形
        }}
        onMouseLeave={(e) => {
          setHover(false);
          const stage = e.target.getStage();
          stage.container().style.cursor = "default"; // 恢復默認鼠標
        }}
      />

      {/* 選中狀態的 X 按鈕 */}
      {isSelected && (
        <>
          {/* "X" 文字 */}
          <Text
            x={-10} // 對齊背景矩形
            y={-12}
            text="X"
            fontSize={20}
            fill="#828fa1"
            fontFamily="Verdana"
            fontStyle="bold"
            align="center"
            onClick={(e) => {
              e.cancelBubble = true; // 防止事件冒泡
              onCancel(); // 調用刪除回調
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "pointer"; // 設定鼠標為手形
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "default"; // 恢復默認鼠標
            }}
          />
        </>
      )}

      {/* 圖片下方的文字背景 */}
      <Rect
        x={-10}
        y={110}
        width={130} // 與 Text 的寬度相同
        height={20} // 根據需要調整高度
        fill={type === "dd" ? "#9bc9bc" : "#a2c9e3"} // 根據 type 設定顏色
        stroke={type === "dd" ? "#065f46" : "#01579b"} // 選中時顯示邊框
        cornerRadius={4} // 圓角設置，非必要
      />

      {/* 圖片下方的文字 */}
      <Text
        x={-10}
        y={114}
        text={name}
        fontSize={14}
        fill="black"
        align="center"
        width={130}
        fontFamily="monospace"
      />
    </Group>
  );
};

export default DraggableImageButton;
