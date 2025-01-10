"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

export default function Home() {
  const [image1, setImage1] = useState(null); // 保存第一張圖片
  const [image2, setImage2] = useState(null); // 保存第二張圖片
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 更新畫布大小
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize); // 監聽螢幕大小變化
    return () => {
      window.removeEventListener("resize", handleResize); // 清除監聽
    };
  }, []);

  // 加載第一張圖片
  useEffect(() => {
    const img1 = new window.Image();
    img1.src = "/dd.svg"; // 第一張圖片的路徑
    img1.onload = () => {
      setImage1(img1); // 圖片加載完成後設置
    };
  }, []);

  // 加載第二張圖片
  useEffect(() => {
    const img2 = new window.Image();
    img2.src = "/netWorker.svg"; // 第二張圖片的路徑
    img2.onload = () => {
      setImage2(img2); // 圖片加載完成後設置
    };
  }, []);

  // 檢查兩張圖片是否重疊
  const checkCollision = (node1, node2) => {
    if (!node1 || !node2) return false;

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

  // 將圖片移到水平方向不重疊的位置，並保持貼合
  const moveToHorizontalSide = (node, otherNode) => {
    const box1 = node.getClientRect();
    const box2 = otherNode.getClientRect();

    // 計算水平移動的新位置
    const newX = box1.x < box2.x ? box2.x - box1.width : box2.x + box2.width;

    // 垂直位置對齊另一個圖片的垂直中心
    node.position({
      x: Math.max(0, Math.min(newX, 1600 - box1.width)), // 確保在畫布範圍內
      y: box2.y, // 完美對齊垂直位置
    });
  };

  // 第一張圖片的拖曳開始事件
  const handleDragStartImage1 = (e) => {
    e.target.moveToTop(); // 將圖片移到最上層
  };

  // 第二張圖片的拖曳開始事件
  const handleDragStartImage2 = (e) => {
    e.target.moveToTop(); // 將圖片移到最上層
  };

  // 第一張圖片的拖曳結束事件
  const handleDragEndImage1 = (e) => {
    if (checkCollision(e.target, image2Ref.current)) {
      moveToHorizontalSide(e.target, image2Ref.current); // 移到水平方向
    }
  };

  // 第二張圖片的拖曳結束事件
  const handleDragEndImage2 = (e) => {
    if (checkCollision(e.target, image1Ref.current)) {
      moveToHorizontalSide(e.target, image1Ref.current); // 移到水平方向
    }
  };

  // 檢查圖片邊界，防止拖出畫布
  const limitDragPosition = (pos, node) => {
    const box = node.getClientRect();
    const newX = Math.max(0, Math.min(pos.x, stageSize.width - box.width));
    const newY = Math.max(0, Math.min(pos.y, stageSize.height - box.height));
    return { x: newX, y: newY };
  };

  // 第一張圖片的拖曳事件
  const handleDragMoveImage1 = (e) => {
    const node = e.target;
    const newPos = limitDragPosition(node.position(), node);
    node.position(newPos); // 限制圖片位置
  };

  // 第二張圖片的拖曳事件
  const handleDragMoveImage2 = (e) => {
    const node = e.target;
    const newPos = limitDragPosition(node.position(), node);
    node.position(newPos); // 限制圖片位置
  };

  console.log(stageSize);
  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      className="bg-gray-200"
    >
      <Layer>
        {/* 第一張圖片 */}
        {image1 && (
          <KonvaImage
            image={image1}
            x={350}
            y={350}
            width={100}
            height={100}
            draggable
            // fill={"blue"}
            ref={image1Ref}
            onDragEnd={handleDragEndImage1}
            onDragStart={handleDragStartImage1}
            onDragMove={handleDragMoveImage1} // 拖動時限制範圍
          />
        )}

        {/* 第二張圖片 */}
        {image2 && (
          <KonvaImage
            image={image2}
            x={500}
            y={500}
            width={100}
            height={100}
            draggable
            // fill={"red"}
            ref={image2Ref}
            onDragStart={handleDragStartImage2}
            onDragEnd={handleDragEndImage2}
            onDragMove={handleDragMoveImage2} // 拖動時限制範圍
          />
        )}
      </Layer>
    </Stage>
  );
}
