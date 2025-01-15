"use client";
import React, { useState } from "react";
import { Group, Image, Rect, Circle, Text } from "react-konva";
import useImage from "use-image";
import TextField from "@mui/material/TextField";
import { Html } from "react-konva-utils";

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
  onDelete, // 新增刪除事件回調
  lightStatus, // 新增燈的狀態 ('red' 或 'green')
  handleTextChange, // 新增文字變更事件回調
  stageRef, // 新增 stageRef
}) => {
  const [image] = useImage(src);
  const [hoverImage] = useImage(hoverSrc);
  const [selectedImage] = useImage(selectedSrc);
  const [trashIcon] = useImage("/trashcan.svg"); // 替換為實際的垃圾桶圖示路徑
  const [closeIcon] = useImage("/close.svg"); // 替換為實際的關閉圖示路徑
  const [hover, setHover] = useState(false);

  const [isEditing, setIsEditing] = useState(false); // 控制是否進入編輯模式
  const [textValue, setTextValue] = useState(name); // 存儲當前文字

  // 計算輸入框的絕對位置
  const calculateInputPosition = () => {
    const stage = stageRef.current.getStage();
    const containerRect = stage.container().getBoundingClientRect();
    return {
      top: containerRect.top + y + 100, // 文字框的 Y 位置
      left: containerRect.left + x - 110, // 文字框的 X 位置
    };
  };

  return (
    <>
      <Group
        x={x}
        y={y}
        draggable
        onDragStart={(e) => {
          e.target.moveToTop(); // 將圖片移到最上層
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
          <Image
            image={closeIcon}
            x={-13}
            y={-15} // 調整位置至適當位置
            width={20}
            height={20}
            onClick={(e) => {
              e.cancelBubble = true;
              onCancel();
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "default";
            }}
          />
        )}
        {isSelected && (
          <Image
            image={trashIcon}
            x={-12}
            y={15} // 調整位置至適當位置
            width={18}
            height={18}
            onClick={(e) => {
              e.cancelBubble = true;
              onDelete();
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              stage.container().style.cursor = "default";
            }}
          />
        )}
        {/* 右上角的紅燈 / 綠燈 */}
        {lightStatus === "red" && (
          <Circle
            x={109} // 圖片右上角
            y={-4}
            radius={8}
            stroke={"#991B1B"}
            strokeWidth={2}
            fill="#EF4444"
          />
        )}
        {lightStatus === "green" && (
          <Circle
            x={109} // 圖片右上角
            y={-4}
            radius={8}
            stroke={"#15803D"}
            strokeWidth={2}
            fill="#22C55E"
          />
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
          onDblClick={() => {
            setIsEditing(true);
          }} // 雙擊切換為輸入框
        />
      </Group>

      {isEditing && (
        <Html>
          <TextField
            value={textValue}
            variant="standard"
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              handleTextChange(textValue);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditing(false);
                handleTextChange(textValue);
              }
            }}
            sx={{
              position: "absolute",
              ...calculateInputPosition(),
              width: "130px",
              textAlign: "center",
              fontSize: "1px",
              fontFamily: "monospace",
            }}
          />
        </Html>
      )}
    </>
  );
};

export default DraggableImageButton;
