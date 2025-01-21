"use client";
import React, { useState } from "react";
import { Group, Image, Rect, Circle, Text } from "react-konva";
import useImage from "use-image";

const DraggableImageButton = ({
  id,
  x,
  y,
  src,
  hoverSrc,
  selectedSrc,
  onDragMove,
  onDragEnd,
  onClick,
  isSelected,
  type,
  name,
  onCancel, // 新增刪除事件回調
  onDelete, // 新增刪除事件回調
  lightStatus, // 新增燈的狀態 ('red' 或 'green')
  showInputBox, // 新增：用於控制是否顯示輸入框的回調
  isEditing,
}) => {
  const [image] = useImage(src);
  const [hoverImage] = useImage(hoverSrc);
  const [selectedImage] = useImage(selectedSrc);
  const [hover, setHover] = useState(false);

  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  const [trashIcon] = useImage("/trashcan.svg"); // 替換為實際的垃圾桶圖示路徑
  const [trashDarkIcon] = useImage("/trashcanDark.svg"); // 替換為實際的垃圾桶圖示路徑
  const [closeIcon] = useImage("/close.svg"); // 替換為實際的關閉圖示路徑
  const [closeDarkIcon] = useImage("/closeDark.svg");

  // 設置滑鼠游標
  const setCursorStyle = (stage, style) => {
    stage.container().style.cursor = style;
  };

  return (
    <>
      <Group
        x={x}
        y={y}
        draggable
        onDragStart={(e) => {
          e.target.moveToTop(); // 將圖片移到最上層f
        }}
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
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDblClick={() => showInputBox(id, x, y, name)} // 雙擊呼叫外部回調，顯示輸入框
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
            setCursorStyle(e.target.getStage(), "pointer");
          }}
          onMouseLeave={(e) => {
            setHover(false);
            setCursorStyle(e.target.getStage(), "default");
          }}
        />
        {/* 選中狀態的 X 按鈕 */}
        {isSelected && (
          <Image
            // image={closeIcon}
            image={isCloseHovered ? closeDarkIcon : closeIcon}
            x={-13}
            y={-15} // 調整位置至適當位置
            width={20}
            height={20}
            onClick={(e) => {
              e.cancelBubble = true;
              onCancel();
              setIsCloseHovered(false);
            }}
            onMouseEnter={(e) => {
              setIsCloseHovered(true);
              setCursorStyle(e.target.getStage(), "pointer");
            }}
            onMouseLeave={(e) => {
              setIsCloseHovered(false);
              setCursorStyle(e.target.getStage(), "default");
            }}
          />
        )}
        {isSelected && (
          <Image
            image={isTrashHovered ? trashDarkIcon : trashIcon}
            x={-12}
            y={15} // 調整位置至適當位置
            width={18}
            height={18}
            onClick={(e) => {
              e.cancelBubble = true;
              onDelete();
            }}
            onMouseEnter={(e) => {
              setIsTrashHovered(true);
              setCursorStyle(e.target.getStage(), "pointer");
            }}
            onMouseLeave={(e) => {
              setIsTrashHovered(false);
              setCursorStyle(e.target.getStage(), "default");
            }}
          />
        )}
        {/* 右上角的紅燈 / 綠燈 */}
        <Circle
          x={109} // 圖片右上角
          y={-4}
          radius={8}
          stroke={lightStatus === "red" ? "#991B1B" : "#15803D"}
          strokeWidth={2}
          fill={lightStatus === "red" ? "#EE4444" : "#22C55E"}
        />

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
          text={isEditing ? "" : name}
          fontSize={14}
          fill="black"
          align="center"
          width={130}
          fontFamily="monospace"
        />
      </Group>
    </>
  );
};

export default DraggableImageButton;
