import React, { useRef, useEffect, useState } from "react";
import { Rect, Transformer, Image, Text } from "react-konva";
import useImage from "use-image";

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
  showInputBox,
  isEditing,
}) => {
  const transformerRef = useRef(null); // 用於操作 Transformer
  const shapeRef = useRef(null); // 用於操作圖形元素
  const [isTransforming, setIsTransforming] = useState(false); // 追蹤是否正在縮放
  const [isDragging, setIsDragging] = useState(false); // 追蹤拖動狀態

  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);

  const [trashIcon] = useImage("/groupTrashcan.svg"); // 替換為實際的垃圾桶圖示路徑
  const [trashDarkIcon] = useImage("/groupTrashcandark.svg"); // 替換為實際的垃圾桶圖示路徑
  const [textIcon] = useImage("/letterT.svg"); // 替換為實際的垃圾桶圖示路徑
  const [textDarkIcon] = useImage("/letterTdark.svg"); // 替換為實際的垃圾桶圖示路徑

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

    // 直接在 Konva 物件上更新位置
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

  // 處理框框調整結束的事件
  const handleTransformEnd = () => {
    const node = shapeRef.current;

    // 計算新框框的寬度與高度
    const newWidth = node.width() * node.scaleX();
    const newHeight = node.height() * node.scaleY();

    // 更新 Konva node 的屬性，避免因縮放比例閃動
    node.setAttrs({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });

    // 更新框框的新位置與大小
    const newBox = {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    };

    // 找出框框內的圖片
    const imagesInBox = images.filter((img) => isImageInBox(img, newBox));

    if (imagesInBox.length <= 1) {
      // 如果框框內圖片數量不足，移除該框框
      setSelectionBoxes((prevBoxes) =>
        prevBoxes.filter((_, idx) => idx !== index)
      );
    } else {
      // 更新框框屬性，包含新位置與框框內圖片
      setSelectionBoxes((prevBoxes) =>
        prevBoxes.map((b, idx) =>
          idx === index ? { ...b, ...newBox, images: imagesInBox } : b
        )
      );

      // 更新不在框框內的圖片屬性，將 groupId 設為 null
      const updatedImages = images.map((img) =>
        imagesInBox.includes(img) ? img : { ...img, groupId: null }
      );
      setImages(updatedImages);
    }

    // 重置縮放比例，避免影響後續操作
    node.scaleX(1);
    node.scaleY(1);
  };

  // 刪除框框
  const handleDelete = () => {
    setSelectionBoxes((prevBoxes) =>
      prevBoxes.filter((_, idx) => idx !== index)
    );
  };

  // 持續將 Transformer 附加到 Rect
  useEffect(() => {
    const transformer = transformerRef.current;
    const shape = shapeRef.current;

    if (transformer && shape) {
      transformer.nodes([shape]); // 附加 Transformer
      transformer.getLayer().batchDraw(); // 刷新圖層
    }
  }, [box, box.isHovered]); // 確保 hover 狀態更新時刷新 Transformer

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
        onDragStart={() => setIsDragging(true)} // 開始拖動
        onDragMove={(e) => {
          handleBoxDrag(e, index);
        }} // 傳遞拖動事件
        onDragEnd={() => setIsDragging(false)} // 結束拖動
        onTransformStart={() => setIsTransforming(true)} // 開始調整大小
        onTransformEnd={(e) => {
          setIsTransforming(false); // 結束調整大小
          handleTransformEnd(e);
        }}
        onMouseEnter={(e) => {
          setSelectionBoxes((prevBoxes) =>
            prevBoxes.map((b, i) =>
              i === index ? { ...b, isHovered: true } : b
            )
          );
          e.target.getStage().container().style.cursor = "move"; // 轉為移動型游標
        }}
        onMouseLeave={(e) => {
          e.target.getStage().container().style.cursor = "default"; // 還原游標
        }}
        onClick={() => {
          setSelectionBoxes((prevBoxes) =>
            prevBoxes.map((b, i) =>
              i === index ? { ...b, isHovered: false } : b
            )
          );
        }} // 滑鼠離開時
      />

      {/* 刪除按鈕 */}
      {box.isHovered && !isTransforming && !isDragging && shapeRef.current && (
        <Image
          image={isTrashHovered ? trashDarkIcon : trashIcon} // 根據 hover 切換圖片
          x={box.x + box.width - 15} // 框框右邊緣
          y={box.y - 35} // 框框上方（負值可以讓 icon 提升到框外）
          width={20}
          height={20}
          onClick={handleDelete}
          onMouseEnter={(e) => {
            setIsTrashHovered(true); // 設置垃圾桶 hover 狀態
            e.target.getStage().container().style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            setIsTrashHovered(false); // 取消垃圾桶 hover 狀態
            e.target.getStage().container().style.cursor = "default";
          }}
        />
      )}

      {/* 文字按鈕 */}
      {box.isHovered && !isTransforming && !isDragging && shapeRef.current && (
        <Image
          image={isTextHovered ? textDarkIcon : textIcon} // 根據 hover 切換圖片
          x={box.x + box.width - 50} // 框框右邊緣
          y={box.y - 36} // 框框上方（負值可以讓 icon 提升到框外）
          width={24}
          height={24}
          onClick={() =>
            showInputBox(
              box.id,
              box.x + box.width / 2, // 水平中心
              box.y - 32, // 中上方 (稍微往框框上方移動 10px)
              box.name || ""
            )
          }
          onMouseEnter={(e) => {
            setIsTextHovered(true);
            e.target.getStage().container().style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            setIsTextHovered(false);
            e.target.getStage().container().style.cursor = "default";
          }}
        />
      )}

      {/* 框框上方的文字背景 */}
      {!isTransforming &&
        !isDragging &&
        (box.name || isEditing) && // 如果有名稱或正在編輯中，顯示背景
        shapeRef.current && (
          <Rect
            x={box.x + box.width / 2 - 65}
            y={box.y - 42}
            width={130} // 與 Text 的寬度相同
            height={28} // 根據需要調整高度
            fill={"#a2c9e3"} // 根據 type 設定顏色
            stroke={"#01579b"} // 選中時顯示邊框
            cornerRadius={2}
          />
        )}

      {/* 框框上方的文字 */}
      {!isTransforming &&
        !isDragging &&
        !isEditing &&
        box.name &&
        shapeRef.current && (
          <Text
            x={box.x + box.width / 2 - 65}
            y={box.y - 34}
            text={box.name || ""}
            fontSize={18}
            fill="black"
            align="center"
            width={130}
            fontFamily="monospace"
            onDblClick={() =>
              showInputBox(
                box.id,
                box.x + box.width / 2, // 水平中心
                box.y - 32, // 中上方 (稍微往框框上方移動 10px)
                box.name || ""
              )
            }
          />
        )}

      {(box.isHovered ||
        (shapeRef.current && shapeRef.current.isDragging())) && (
        <Transformer
          ref={transformerRef}
          anchorSize={12}
          anchorStrokeWidth={2}
          rotateEnabled={false} // 禁用旋轉
        />
      )}
    </>
  );
};

export default SelectionBox;
