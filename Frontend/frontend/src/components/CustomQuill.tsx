import React, { forwardRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "color",
  "background",
  "align",
  "code-block",
];

// ✅ Use forwardRef to avoid `findDOMNode`
const CustomQuill = forwardRef(({ value, onChange }, ref) => {
  return (
    <ReactQuill
      ref={ref} // ✅ Safe ref usage
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      className="bg-white"
    />
  );
});

export default CustomQuill;
