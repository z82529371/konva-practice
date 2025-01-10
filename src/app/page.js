"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Circle, Image as KonvaImage } from "react-konva";

export default function Home() {
  const [image1, setImage1] = useState(null); // 保存第一張圖片
  const [image2, setImage2] = useState(null); // 保存第二張圖片
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);

  // 加載第一張圖片
  useEffect(() => {
    const img1 = new window.Image();
    img1.src = "/dd.svg"; // 第一張圖片的路徑
    img1.onload = () => {
      setImage1(img1); // 圖片加載完成後設置
    };
  }, []);

  // 檢查兩張圖片是否重疊
  const checkCollision = (node1, node2) => {
    if (!node1 || !node2) return false;

    // 取得邊界矩形
    const box1 = node1.getClientRect();
    const box2 = node2.getClientRect();

    return !(
      (
        box1.x > box2.x + box2.width || // box1 在 box2 的右側
        box1.x + box1.width < box2.x || // box1 在 box2 的左側
        box1.y > box2.y + box2.height || // box1 在 box2 的下方
        box1.y + box1.height < box2.y
      ) // box1 在 box2 的上方
    );
  };

  // 加載第二張圖片
  useEffect(() => {
    const img2 = new window.Image();
    img2.src = "/netWorker.svg"; // 第二張圖片的路徑
    img2.onload = () => {
      setImage2(img2); // 圖片加載完成後設置
    };
  }, []);

  return (
    <Stage width={1600} height={1600} className="bg-gray-200" draggable>
      <Layer>
        <Rect x={50} y={50} width={100} height={100} fill="blue" draggable />
        <Circle x={200} y={200} radius={50} fill="red" draggable />

        {/* 第一張圖片 */}
        {image1 && (
          <KonvaImage
            image={image1} // 傳遞 HTMLImageElement
            x={350}
            y={350}
            width={100}
            height={100}
            draggable
            ref={image1Ref} // 可選：用於操作圖片
            onDragMove={handelDragMove}
          />
        )}

        {/* 第二張圖片 */}
        {image2 && (
          <KonvaImage
            image={image2} // 傳遞 HTMLImageElement
            x={500}
            y={500}
            width={100}
            height={100}
            draggable
            ref={image2Ref} // 可選：用於操作圖片
            onDragMove={handelDragMove}
          />
        )}
      </Layer>
    </Stage>
  );
}
