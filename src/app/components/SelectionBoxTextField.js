import React from "react";
import TextField from "@mui/material/TextField";

const SelectionBoxTextField = ({
  inputBox,
  setInputBox,
  setSelectionBoxes,
}) => {
  if (!inputBox) return null;

  // 處理輸入框的輸入
  const handleInputChange = (text) => {
    setInputBox((prev) => ({ ...prev, text }));
  };

  // 處理輸入框的失去焦點
  const handleInputBlur = () => {
    setSelectionBoxes((prev) =>
      prev.map((box) =>
        box.id === inputBox.id
          ? { ...box, name: inputBox.text.trim() || box.name, isEditing: false }
          : box
      )
    );
    setInputBox(null);
  };

  return (
    <TextField
      value={inputBox.text}
      onChange={(e) => handleInputChange(e.target.value)}
      onBlur={handleInputBlur}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
      sx={{
        position: "absolute",
        top: inputBox.y - 10, // 偏移框框中心上方
        left: inputBox.x - 66, // 偏移框框中心左方
        width: "132px",
        "& .MuiInputBase-input ": {
          height: "28px",
          fontSize: "18px",
          padding: "0.7px 0",
          fontFamily: "monospace",
          textAlign: "center",
        },
      }}
    />
  );
};

export default SelectionBoxTextField;
