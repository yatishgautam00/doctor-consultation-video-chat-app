"use client";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReceiptForm = () => {
  const [medicines, setMedicines] = useState([
    { name: "", time: "", foodInstruction: "after", extraNotes: "" },
  ]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isValid, setIsValid] = useState(true); // Start with true for disabling button

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", time: "", foodInstruction: "before", extraNotes: "" },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleGenerateImage = async () => {
    const element = document.getElementById("receipt-preview");
    if (element) {
      const canvas = await html2canvas(element, { useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "doctor-receipt.png";
      link.click();
    }
  };

  useEffect(() => {
    const allValid = medicines.every(
      (medicine) =>
        medicine.name.trim() !== "" &&
        medicine.time.trim() !== "" &&
        medicine.foodInstruction.trim() !== ""
    );
    setIsValid(!allValid); // Set isValid to false if any field is invalid
  }, [medicines]);

  return (
    <div
      className={`fixed bottom-4 left-4 w-80 z-50 p-4 ${
        isFormVisible ? "bg-white" : "bg-none"
      }`}
    >
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className={`bg-blue-500 text-white px-2 py-1 rounded mb-2 ${
          isFormVisible ? "w-full" : "w-max shadow-lg px-4 py-2 "
        }`}
      >
        {isFormVisible ? "Hide Receipt Form" : "Receipt"}
      </button>
      {isFormVisible && (
        <>
          <h2 className="text-lg font-bold mb-2 text-center">Doctor Receipt</h2>
          <div className="mb-2">
            <Table className="w-full">
              <TableCaption className="text-center">
                Verified By VaidyaPadma
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Instruction</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <input
                        type="text"
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                        className="p-1 border rounded"
                        placeholder="Medicine"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={medicine.time}
                        onChange={(e) =>
                          handleMedicineChange(index, "time", e.target.value)
                        }
                        className="p-1 border rounded"
                      >
                        <option value="">Time</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="2 times">2 Times</option>
                        <option value="3 times">3 Times</option>
                        <option value="both">Both (M & E)</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        value={medicine.foodInstruction}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "foodInstruction",
                            e.target.value
                          )
                        }
                        className="p-1 border rounded"
                      >
                        <option value="before">Before Food</option>
                        <option value="after">After Food</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <input
                          value={medicine.extraNotes}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "extraNotes",
                              e.target.value
                            )
                          }
                          className={`p-1 border rounded ${
                            medicine.extraNotes.length >= 25
                              ? "bg-gray-300"
                              : "bg-white"
                          }`}
                          placeholder="Additional notes..."
                          maxLength={25}
                        />
                        <div className="absolute right-1 top-0 text-sm text-gray-500">
                          {medicine.extraNotes.length}/25
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-full flex flex-row h-full gap-3 ">
            <button
              onClick={handleAddMedicine}
              className="bg-green-500 w-full text-white px-2 py-1 rounded"
            >
              Add Medicine
            </button>
            <button
              onClick={handleGenerateImage}
              className={`${!isValid ? " bg-blue-500" :"bg-gray-500 cursor-not-allowed"} w-full text-white px-2 py-1 rounded`}
              disabled={isValid} // Disable button if form is invalid
            >
              Generate Image
            </button>
          </div>
          <div
            id="receipt-preview"
            className="receipt-preview p-6"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "600px",
              height: "auto",
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute inset-0 flex justify-center items-center"
              style={{
                color: "rgba(0, 0, 0, 0.1)",
                fontSize: "4rem",
                transform: "rotate(-30deg)",
                pointerEvents: "none",
              }}
            >
              VaidyaPadma
            </div>

            <h2 className="text-xl font-bold mb-2">Receipt By Dr. Narendra</h2>
            <Table className="w-full">
              <TableCaption className="text-center">
                Verified By VaidyaPadma
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Medicine Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Instruction</TableHead>
                  <TableHead className="">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine, index) => (
                  <TableRow key={index}>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>{medicine.time}</TableCell>
                    <TableCell>
                      {medicine.foodInstruction === "before"
                        ? "Before Food"
                        : "After Food"}
                    </TableCell>
                    <TableCell>{medicine.extraNotes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReceiptForm;
