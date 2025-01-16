import React from "react";
import { Rect } from "react-konva";

const SelectionBox = ({
  box,
  index,
  images,
  setImages,
  lines,
  setLines,
  selectionBoxes,
  setSelectionBoxes,
}) => {
  // 當框框拖動時，同步更新框內的圖片和線條
  const handleBoxDrag = (e, boxIndex) => {
    const { x, y } = e.target.position();

    // 當前框框
    const currentBox = selectionBoxes[boxIndex];
    const currentImages = currentBox.images || [];
    const currentLines = currentBox.lines || [];

    // 計算偏移量
    const deltaX = x - currentBox.x;
    const deltaY = y - currentBox.y;

    // 更新框框位置
    setSelectionBoxes((prevBoxes) =>
      prevBoxes
        .map((box, index) =>
          index === boxIndex
            ? {
                ...box,
                x,
                y,
              }
            : box
        )
        .filter((box) => box.images.length > 1 || box.lines.length > 0)
    );

    // 更新圖片位置
    const updatedImages = images.map((img) => {
      if (currentImages.some((selectedImg) => selectedImg.id === img.id)) {
        return {
          ...img,
          x: img.x + deltaX,
          y: img.y + deltaY,
        };
      }
      return img;
    });

    // 更新線條位置
    const updatedLines = lines.map((line) => {
      const isStartInBox = currentImages.some(
        (img) => img.id === line.start.id
      );
      const isEndInBox = currentImages.some((img) => img.id === line.end.id);

      if (isStartInBox || isEndInBox) {
        return {
          ...line,
          start: isStartInBox
            ? {
                ...line.start,
                x: line.start.x + deltaX,
                y: line.start.y + deltaY,
              }
            : line.start,
          end: isEndInBox
            ? {
                ...line.end,
                x: line.end.x + deltaX,
                y: line.end.y + deltaY,
              }
            : line.end,
        };
      }
      return line;
    });

    // 同步更新圖片和線條
    setImages(updatedImages);
    setLines(updatedLines);
  };

  return (
    <Rect
      key={index}
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke="#1778ba"
      strokeWidth={3}
      draggable
      onDragMove={(e) => handleBoxDrag(e, index)} // 傳遞拖動事件
    />
  );
};

export default SelectionBox;
