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
    const stage = e.target.getStage();
    const stageWidth = stage.width(); // 當前視窗寬度
    const stageHeight = stage.height(); // 當前視窗高度

    // 當前框框
    const currentBox = selectionBoxes[boxIndex];
    const { width, height } = currentBox;
    const strokeWidth = 3;

    console.log(stageHeight, stageWidth, box.width, box.height);

    const currentImages = currentBox.images || [];
    const currentLines = currentBox.lines || [];

    // 限制框框的拖曳範圍，使其剛好契合畫布邊框
    const newX = Math.max(0, Math.min(x, stageWidth - width));
    const newY = Math.max(0, Math.min(y, stageHeight - height));

    // 計算偏移量
    const deltaX = newX - currentBox.x;
    const deltaY = newY - currentBox.y;

    e.target.x(newX);
    e.target.y(newY);

    // 更新框框位置
    setSelectionBoxes((prevBoxes) =>
      prevBoxes
        .map((box, index) =>
          index === boxIndex
            ? {
                ...box,
                x: newX,
                y: newY,
              }
            : box
        )
        .filter((box) => box.images.length > 1)
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
