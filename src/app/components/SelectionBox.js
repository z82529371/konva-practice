import React, { useRef, useEffect } from "react";
import { Rect, Transformer } from "react-konva";

const SelectionBox = ({
  box,
  index,
  images,
  setImages,
  lines,
  setLines,
  selectionBoxes,
  setSelectionBoxes,
  isImageInBox,
}) => {
  const transformerRef = useRef(null); // 用於操作 Transformer
  const shapeRef = useRef(null); // 用於操作圖形元素

  // 當框框拖動時，同步更新框內的圖片和線條
  const handleBoxDrag = (e, boxIndex) => {
    const { x, y } = e.target.position();
    const stage = e.target.getStage();
    const stageWidth = stage.width(); // 當前視窗寬度
    const stageHeight = stage.height(); // 當前視窗高度

    // 當前框框
    const currentBox = selectionBoxes[boxIndex];
    const { width, height } = currentBox;

    const currentImages = currentBox.images || [];

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

  // 初始化 Transformer
  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const newWidth = node.width() * node.scaleX(); // 計算新寬度
    const newHeight = node.height() * node.scaleY(); // 計算新高度

    const newBox = {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    };

    const imagesInBox = images.filter((img) => isImageInBox(img, newBox));

    if (imagesInBox.length <= 1) {
      // 如果框框內沒有圖片，移除該框框
      setSelectionBoxes((prevBoxes) =>
        prevBoxes.filter((b, idx) => idx !== index)
      );
    } else {
      // 否則更新框框屬性
      setSelectionBoxes((prevBoxes) =>
        prevBoxes.map((b, idx) =>
          idx === index
            ? {
                ...b,
                ...newBox,
              }
            : b
        )
      );
    }

    // 重置縮放比例
    node.scaleX(1);
    node.scaleY(1);
  };

  // 持續將 Transformer 附加到 Rect
  useEffect(() => {
    const transformer = transformerRef.current;
    const shape = shapeRef.current;

    if (transformer && shape) {
      transformer.nodes([shape]); // 附加 Transformer
      transformer.getLayer().batchDraw(); // 刷新圖層
    }
  }, [box]);

  return (
    <>
      <Rect
        ref={shapeRef}
        key={index}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        stroke="#1778ba"
        strokeWidth={3}
        draggable
        onDragMove={(e) => handleBoxDrag(e, index)} // 傳遞拖動事件
        onTransformEnd={handleTransformEnd}
      />
      <Transformer
        ref={transformerRef}
        rotateEnabled={false} // 禁用旋轉
      />
    </>
  );
};

export default SelectionBox;
