"use client";
import React, { useRef, useState } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import Button from "@mui/material/Button"; // 引入 MUI 的 Button
import useImage from "use-image";

// 圖片按鈕組件
const DraggableImageButton = ({ x, y, src, onDragMove }) => {
  const [image] = useImage(src); // 使用 useImage 加載圖片
  const [hovered, setHovered] = useState(false);

  return (
    <Image
      x={x}
      y={y}
      image={image}
      draggable
      onDragMove={onDragMove} // 當圖片拖曳時觸發事件
      width={100}
      height={100}
      stroke={hovered ? "blue" : undefined} // 選中時加框
      strokeWidth={hovered ? 4 : 0}
      onMouseEnter={() => setHovered(true)} // 滑鼠移入時設置為 true
      onMouseLeave={() => setHovered(false)} // 滑鼠移出時設置為 false
    />
  );
};

const App = () => {
  const [images, setImages] = useState([]); // 儲存所有圖片的資訊
  const lineRef = useRef();
  const layerRef = useRef(); // 用於強制刷新 Layer

  const addImage = (src, x, y) => {
    setImages((prev) => [
      ...prev,
      { id: Date.now(), src, x, y }, // 每張圖片有唯一 ID
    ]);
  };

  const updateLine = () => {
    if (lineRef.current) {
      const points = images.flatMap((img) => [img.x + 50, img.y + 50]);
      lineRef.current.points(points);
      layerRef.current.batchDraw();
    }
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
      <Stage width={window.innerWidth} height={window.innerHeight}>
        {/* 線條的 Layer */}
        <Layer ref={layerRef}>
          <Line
            ref={lineRef}
            points={images.flatMap((img) => [img.x + 50, img.y + 50])} // 動態生成線條
            stroke="black"
            strokeWidth={2}
          />
        </Layer>

        {/* 圖片的 Layer */}
        <Layer>
          {images.map((img) => (
            <DraggableImageButton
              key={img.id}
              x={img.x}
              y={img.y}
              src={img.src}
              onDragMove={(e) => {
                // 更新拖曳後的座標
                setImages((prev) =>
                  prev.map((item) =>
                    item.id === img.id
                      ? { ...item, x: e.target.x(), y: e.target.y() }
                      : item
                  )
                );
                updateLine(); // 更新線條
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
