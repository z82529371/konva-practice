// DraggableImageButton.js
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
      {image && (
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
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        />
      )}
      <Rect
        x={-10}
        y={110}
        width={130} // 與 Text 的寬度相同
        height={20} // 根據需要調整高度
        fill={type === "dd" ? "#9bc9bc" : "#a2c9e3"} // 根據 type 設定顏色
        stroke={type === "dd" ? "#065f46" : "#01579b"} // 選中時顯示邊框
        cornerRadius={4} // 圓角設置，非必要
      />
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
