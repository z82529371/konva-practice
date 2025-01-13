"use client";
import React, { useRef, useState } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import Button from "@mui/material/Button"; // 引入 MUI 的 Button
import useImage from "use-image";

// 圖片按鈕組件
const DraggableImageButton = ({
  x,
  y,
  src,
  onDragMove,
  onClick,
  onDblClick,
  isSelected,
}) => {
  const [image] = useImage(src); // 使用 useImage 加載圖片
  const [hover, setHover] = useState(false);

  return (
    <Image
      x={x}
      y={y}
      image={image}
      draggable
      onDragMove={onDragMove} // 當圖片拖曳時觸發事件
      onClick={onClick} // 點擊時觸發
      onDblClick={onDblClick} // 雙擊時觸發
      width={100}
      height={100}
      stroke={hover || isSelected ? "red" : "blue"} // 選中圖片時顯示紅色邊框
      strokeWidth={isSelected ? 4 : 2}
      onMouseEnter={() => setHover(true)} // 滑鼠進入時顯示紅色邊框
      onMouseLeave={() => setHover(false)} // 滑鼠離開時恢復
    />
  );
};

const App = () => {
  const [images, setImages] = useState([]); // 儲存所有圖片的資訊
  const [lines, setLines] = useState([]); // 儲存所有線條的資訊
  const [selectedImage, setSelectedImage] = useState(null); // 追蹤當前被選中的圖片

  console.log(lines);

  // 新增圖片
  const addImage = (src, x, y) => {
    setImages((prev) => [
      ...prev,
      { id: Date.now(), src, x, y }, // 每張圖片有唯一 ID
    ]);
  };

  // 檢查是否已經有連線
  const isAlreadyConnected = (image1, image2) => {
    return lines.some(
      (line) =>
        (line.start.id === image1.id && line.end.id === image2.id) || // 正向檢查
        (line.start.id === image2.id && line.end.id === image1.id) // 反向檢查
    );
  };

  // 處理圖片點擊事件
  const handleImageClick = (image) => {
    if (selectedImage) {
      // 如果已有選擇的圖片，檢查是否與當前圖片相同
      if (selectedImage.id === image.id) {
        // 如果是同一張圖片，則不執行新增線條邏輯
        return;
      } else if (isAlreadyConnected(selectedImage, image)) {
        // 如果已經有連線，則不執行新增線條邏輯
        return;
      }
      // 新增一條線
      setLines((prev) => [...prev, { start: selectedImage, end: image }]);
      setSelectedImage(null); // 重置選擇
    } else {
      // 如果尚未選擇，設置當前圖片為選擇的起點
      setSelectedImage(image);
    }
  };

  // 處理雙擊取消選中
  const handleImageDblClick = () => {
    setSelectedImage(null); // 取消選中
  };

  // 處理圖片拖動事件
  const handleImageDrag = (img, x, y) => {
    // 更新圖片的座標
    setImages((prev) =>
      prev.map((item) => (item.id === img.id ? { ...item, x, y } : item))
    );

    // 如果拖動的是選中的圖片，更新選中圖片的座標
    if (selectedImage && selectedImage.id === img.id) {
      setSelectedImage({ ...selectedImage, x, y });
    }

    // 更新與該圖片相關的線條的起點或終點座標
    setLines((prev) =>
      prev.map((line) => {
        if (line.start.id === img.id) {
          return { ...line, start: { ...line.start, x, y } }; // 更新起點
        } else if (line.end.id === img.id) {
          return { ...line, end: { ...line.end, x, y } }; // 更新終點
        } else {
          return line; // 其他線條不變
        }
      })
    );
  };

  // 計算直角線的點
  const calculateLinePoints = (start, end) => {
    const startX = start.x + 50; // 起點中心
    const startY = start.y + 50;
    const endX = end.x + 50; // 終點中心
    const endY = end.y + 50;

    let midX, midY;

    // 判斷起點和終點的相對位置，生成直角路徑
    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
      // 水平優先（左右連接）
      midX = endX;
      midY = startY;
    } else {
      // 垂直優先（上下連接）
      midX = startX;
      midY = endY;
    }

    return [startX, startY, midX, midY, endX, endY];
  };

  return (
    <div>
      {/* 新增圖片 1 的按鈕 */}
      <Button
        variant="contained"
        onClick={() => addImage("/dd.svg", 100, 100)} // 新增圖片 1
        sx={{ position: "absolute", top: 10, left: 10, zIndex: 100 }}
      >
        Add Image 1
      </Button>
      {/* 新增圖片 2 的按鈕 */}
      <Button
        variant="contained"
        onClick={() => addImage("/netWorker.svg", 300, 300)} // 新增圖片 2
        sx={{ position: "absolute", top: 10, left: 150, zIndex: 100 }}
      >
        Add Image 2
      </Button>

      {/* Konva 畫布 */}
      <Stage width={window.innerWidth} height={window.innerHeight}>
        {/* 線條的 Layer */}
        <Layer>
          {lines.map((line, index) => (
            <Line
              key={index}
              points={calculateLinePoints(line.start, line.end)} // 傳入已計算的中間點
              stroke="black"
              strokeWidth={2}
            />
          ))}
        </Layer>

        {/* 圖片的 Layer */}
        <Layer>
          {images.map((img) => (
            <DraggableImageButton
              key={img.id}
              x={img.x}
              y={img.y}
              src={img.src}
              isSelected={selectedImage && selectedImage.id === img.id} // 是否被選中
              onDragMove={(e) =>
                handleImageDrag(img, e.target.x(), e.target.y())
              } // 更新拖動位置
              onClick={() => handleImageClick(img)} // 點擊圖片時觸發
              onDblClick={handleImageDblClick} // 雙擊取消選中
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
