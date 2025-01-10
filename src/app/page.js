"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text } from "react-konva";
import { Button, Box } from "@mui/material";

export default function Home() {
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [images1, setImages1] = useState([]); // 儲存 Image1 的陣列
  const [images2, setImages2] = useState([]); // 儲存 Image2 的陣列
  const allRefs = useRef([]); // 統一管理所有圖片的引用

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

  // 加載圖片的方法
  const loadImage = (src) => {
    const img = new window.Image();
    img.src = src;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  };

  // 新增 image1
  const addImage1 = async () => {
    const img = await loadImage("/dd.svg");
    setImages1((prev) => [
      ...prev,
      {
        id: `image1-${prev.length}`,
        image: img,
        x: 100 + prev.length * 100,
        y: 100,
        label: `Image 1 - ${prev.length}`, // 添加標籤
      },
    ]);
  };

  // 新增 image2
  const addImage2 = async () => {
    const img = await loadImage("/netWorker.svg");
    setImages2((prev) => [
      ...prev,
      {
        id: `image2-${prev.length}`,
        image: img,
        x: 100 + prev.length * 100,
        y: 200,
        label: `Image 2 - ${prev.length}`, // 添加標籤
      },
    ]);
  };

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

  // 單一拖曳結束事件
  const handleDragEnd = (e) => {
    const node = e.target;
    allRefs.current.forEach((ref) => {
      if (ref && ref !== node && checkCollision(node, ref)) {
        moveToHorizontalSide(node, ref); // 發生碰撞時移動圖片
      }
    });
  };

  // 檢查圖片邊界，防止拖出畫布
  const limitDragPosition = (pos, node) => {
    const box = node.getClientRect();
    const newX = Math.max(0, Math.min(pos.x, stageSize.width - box.width));
    const newY = Math.max(0, Math.min(pos.y, stageSize.height - box.height));
    return { x: newX, y: newY };
  };

  // 拖曳移動事件
  const handleDragMove = (e) => {
    const node = e.target;
    const newPos = limitDragPosition(node.position(), node);
    node.position(newPos); // 限制圖片位置
  };

  // 更改指針樣式為手指
  const handleMouseEnter = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = "pointer";
  };

  // 恢復指針樣式為默認
  const handleMouseLeave = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = "default";
  };

  // 圖片的拖曳開始事件
  const handleDragStartImage = (e) => {
    e.target.moveToTop(); // 將圖片移到最上層
  };

  return (
    <>
      <Box>
        <Button variant="contained" color="primary" onClick={addImage1}>
          Add Image 1
        </Button>
        <Button variant="contained" color="secondary" onClick={addImage2}>
          Add Image 2
        </Button>

        <Stage
          width={stageSize.width}
          height={stageSize.height}
          className="bg-gray-200"
        >
          <Layer>
            {/* 動態渲染 Image1 */}
            {images1.map((img, index) => (
              <React.Fragment key={img.id}>
                <KonvaImage
                  image={img.image}
                  x={img.x}
                  y={img.y}
                  width={100}
                  height={100}
                  draggable
                  ref={(node) => allRefs.current.push(node)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onDragStart={handleDragStartImage}
                />
                <Text
                  text={img.label}
                  x={img.x}
                  y={img.y + 110} // 位置在圖片下方
                  fontSize={14}
                  fill="black"
                />
              </React.Fragment>
            ))}
            {/* 動態渲染 Image2 */}
            {images2.map((img, index) => (
              <React.Fragment key={img.id}>
                <KonvaImage
                  image={img.image}
                  x={img.x}
                  y={img.y}
                  width={100}
                  height={100}
                  draggable
                  ref={(node) => allRefs.current.push(node)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onDragStart={handleDragStartImage}
                />
                <Text
                  text={img.label}
                  x={img.x}
                  y={img.y + 110} // 位置在圖片下方
                  fontSize={14}
                  fill="black"
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </Box>
    </>
  );
}
