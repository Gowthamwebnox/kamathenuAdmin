"use client";

import type React from "react";

import {
  useState,
  type ChangeEvent,
  useEffect,
  useRef,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, X, Upload } from "lucide-react";
import { S3Storage } from "@/lib/s3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
// import ProductEditor from "@/components/common/ProductEditor";
// import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import axiosInstance from "@/app/utils/axiosInstance";
import { toast} from "sonner";




// Dynamically import RichTextEditor with SSR disabled
const RichTextEditor = dynamic(
  () => import('@/components/ui/RichText/rich-text-editor').then(mod => mod.RichTextEditor),
  { ssr: false }
);

// Client-side only wrapper component for RichTextEditor
const localUserData=localStorage.getItem("user-store");
console.log("localUserData");
console.log(localUserData);
var userData:any=null;
if(localUserData){
  userData=JSON.parse(localUserData);
  console.log(userData.state.user.userId);
}
const RichTextEditorSection = ({ content, setContent, isEditMode }: { 
  content: string; 
  setContent: (content: string) => void;
  isEditMode: boolean;
}) => {
  if (!isEditMode) {
    return (
      <div className="p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return <RichTextEditor initialValue={content} onChange={setContent} />;
};

// interface SubCategory {
//   id: string;
//   name: string;
//   description: string;
//   parentCategoryId: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface Category {
  id: string;
  name: string;
  description: string;
  // parentCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
  // subCategories: SubCategory[];
  // parentCategory: Category | null;
}

interface InputFieldProps {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  existingFiles?: string[];
  onFileRemoved?: (url: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
}) => (
  <div className={`relative w-full ${className}`}>
    <label className="text-sm text-gray-600 mb-1 block">{label}</label>
    {type === "textarea" ? (
      <Textarea
        name={name}
        className="w-full"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    ) : (
      <Input
        type={type}
        name={name}
        className="w-full"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

// Custom File Upload Component
const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  existingFiles = [],
  onFileRemoved,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const s3Storage = new S3Storage("products");

  useEffect(() => {
    // Initialize previews with existing files
    if (existingFiles.length > 0) {
      setPreviews(existingFiles);
    }

    // Clean up object URLs on unmount
    return () => {
      previews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [existingFiles]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (selectedFiles: File[]) => {
    // Filter for image files only
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    // Create object URLs for previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    // Update state
    setFiles((prev) => [...prev, ...imageFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Upload files to S3
    await uploadFiles(imageFiles);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const fileBuffer = await file.arrayBuffer();
        const fileName = `${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          ""
        )}`;

        const imageUrl = await s3Storage.uploadFile({
          file: Buffer.from(fileBuffer),
          fileName,
          contentType: file.type,
        });

        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onFilesUploaded(uploadedUrls);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    // Get the preview URL to remove
    const previewToRemove = previews[index];

    // If it's a blob URL, revoke it
    if (previewToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove);
    } else if (onFileRemoved) {
      // If it's an existing file URL, call the removal callback
      onFileRemoved(previewToRemove);
    }

    // Update state
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-dashed border-2 ${
          isDragging ? "border-red-500 bg-red-50" : "border-gray-300"
        } 
                    p-6 rounded-lg text-center flex flex-col items-center justify-center transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-center items-center mb-4">
          <Image
            src="/assets/images/drag-and-drop.png"
            alt="Upload files"
            width={150}
            height={150}
          />
        </div>

        <h4 className="text-lg font-medium mb-2">Drop or select a file</h4>
        <p className="text-gray-500 mb-4">
          Drop files here or click to browse through your machine.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        <Button
          type="button"
          onClick={handleBrowseClick}
          variant="outline"
          className="mt-2"
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Browse Files"}
        </Button>
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative h-24 w-full rounded-lg overflow-hidden">
                <Image
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    sellerId: "",
    categoryId: "",
    name: "",
    description: "",
    aboutProduct: "",
    isApproved: false,
    packageDetails: "",
    productOutput: "",
    deliveryDetails: "",
    deliveryInstruction: "",
    price: "",
    GST: {
      percentage: 0
    },
    images: [] as { imageUrl: string; isPrimary: boolean }[],
    productDiscountType: "",
    productDiscountValue: 0,
    productDiscountStartDate: "",
    productDiscountEndDate: "",
  });

  const [content, setContent] = useState<string>(
    "<p>Hello world! This is a <strong>rich text editor</strong> built with <em>HeroUI</em>.</p>"
  );

  // const { data, status } = useSession();


  var status="authenticated"
  const data={
    user:{
      sellerId:userData.state.user.userId
    }
  }
  // useEffect(() => {
  //   if (status === "authenticated" && data?.user?.sellerId) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       sellerId: data.user.sellerId,
  //     }));
  //   }
  // });

  // Removed newVariant state since we're not using variants anymore

  const [isPublished, setIsPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  // const [filteredSubCategories, setFilteredSubCategories] = useState<
  //   SubCategory[]
  // >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    discountType: "",
    discountValue: 0,
    startDate: "",
    endDate: "",
  });

  const router = useRouter();
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerIdAndCategories = async () => {
      await fetchSellerId();

      console.log("sellerId", sellerId);
      if (status === "authenticated" && sellerId) {
        setFormData((prev) => ({
          ...prev,
          sellerId: sellerId,
        }));
      }
      const fetchCategories = async () => {
        try {
          const response: any = await axiosInstance.get<Category[]>('/seller/fetchCategory');
          setCategories(response?.data?.categories || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          // Fallback to mock data if API fails
          setCategories([
            {
              id: "1",
              name: "Electronics",
              description: "Electronic devices and accessories",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Clothing",
              description: "Apparel and fashion items",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ]);
        }
      };

      fetchCategories();
    };

    fetchSellerIdAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);   
      
        

  const fetchSellerId=async()=>{
    const response:any=await axiosInstance.get(`http://localhost:8000/api/admin/getSeller/${userData.state.user.userId}`)
    console.log("response",response.data[0].id);
   setSellerId(response.data[0].id);
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // if (name === "categoryId") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     subCategoryId: "",
    //   }));

    //   // const selectedCategory = categories.find(
    //   //   (category) => category.id === value
    //   // );

    //   // if (selectedCategory && selectedCategory.subCategories) {
    //   //   setFilteredSubCategories(selectedCategory.subCategories);
    //   // } else {
    //   //   setFilteredSubCategories([]);
    //   // }
    // }
  };

  // Removed variant image handling functions since we're not using variants anymore

  const handleAboutProductChange = (content: any) => {
    setFormData((prev) => ({
      ...prev,
      aboutProduct: JSON.stringify(content),
    }));
  };

  // Image handling functions for product images
  const handleProductImagesUploaded = (urls: string[]) => {
    const isFirstImages = formData.images.length === 0;
    const newImages = urls.map((url, index) => ({
      imageUrl: url,
      isPrimary: isFirstImages && index === 0,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleProductImageRemoved = (url: string) => {
    setFormData((prev) => {
      const remainingImages = prev.images.filter((img) => img.imageUrl !== url);

      if (
        remainingImages.length > 0 &&
        prev.images.find((img) => img.imageUrl === url)?.isPrimary
      ) {
        remainingImages[0].isPrimary = true;
      }

      return {
        ...prev,
        images: remainingImages,
      };
    });
  };

  const handleProductSetPrimaryImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isPrimary: img.imageUrl === imageUrl,
      })),
    }));
  };

  // const handleRemoveVariant = (index: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     variants: prev.variants.filter((_, i) => i !== index),
  //   }));
  // };

  // const handleAddDiscount = () => {
  //   if (newDiscount.discountType && newDiscount.discountValue > 0) {
  //     const startDate = newDiscount.startDate
  //       ? new Date(newDiscount.startDate).toISOString()
  //       : new Date().toISOString();

  //     const endDate = newDiscount.endDate
  //       ? new Date(newDiscount.endDate).toISOString()
  //       : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString();

  //     setNewVariant((prev) => ({
  //       ...prev,
  //       discounts: [
  //         ...prev.discounts,
  //         {
  //           discountType: newDiscount.discountType,
  //           discountValue: newDiscount.discountValue,
  //           startDate: startDate,
  //           endDate: endDate,
  //         },
  //       ],
  //     }));

  //     setNewDiscount({
  //       discountType: "",
  //       discountValue: 0,
  //       startDate: "",
  //       endDate: "",
  //     });
  //   } else {
  //     alert("Please fill in all required discount fields correctly.");
  //   }
  // };

  // const handleRemoveDiscount = (index: number) => {
  //   setNewVariant((prev) => ({
  //     ...prev,
  //     discounts: prev.discounts.filter((_, i) => i !== index),
  //   }));
  // };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!formData.name || !formData.categoryId) {
        alert("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      if (formData.images.length === 0) {
        alert("Please add at least one image.");
        setIsLoading(false);
        return;
      }

      const productData = {
        sellerId: formData.sellerId,
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        aboutProduct: content,
        isApproved: isPublished,
        packageDetails: formData.packageDetails,
        productOutput: formData.productOutput,
        deliveryDetails: formData.deliveryDetails,
        deliveryInstruction: formData.deliveryInstruction,
        price: formData.price,
        GST: formData.GST.percentage ? {
          percentage: formData.GST.percentage
        } : undefined,
        images: formData.images,
        productDiscountType: newDiscount.discountType,
        productDiscountValue: newDiscount.discountValue,
        productDiscountStartDate: newDiscount.startDate,
        productDiscountEndDate: newDiscount.endDate,
      };

      // Mock API call for now - replace with actual API when ready
      console.log("Product Data to be sent:", productData);
      const response: any = await axiosInstance.post("/seller/sellerNewProduct", productData);
      // console.log("Product Created:", response?.data);
      // router.push("/seller/products");
      toast.success("Product created successfully!");
      // For now, just show success message


      setFormData({
        sellerId: "",
        categoryId: "",
        name: "",
        description: "",
        aboutProduct: "<p>Hello world! This is a <strong>rich text editor</strong> built with <em>HeroUI</em>.</p>",
        isApproved: false,
        packageDetails: "",
        productOutput: "",
        deliveryDetails: "",
        deliveryInstruction: "",
        price: "",
        GST: {
          percentage: 0,
        },
        images: [],
        productDiscountType: "",
        productDiscountValue: 0,
        productDiscountStartDate: "",
        productDiscountEndDate: "",
      });
      // Removed setNewVariant since we're not using variants anymore
    } catch (error: any) {
      console.error(
        "Error creating product:",
        error.response ? error.response.data : error
      );
      toast.error('There was an error creating the product. Please check the details.')
      alert(
        "There was an error creating the product. Please check the details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isEditMode, setIsEditMode] = useState(true);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <ChevronLeft
          className="mr-2 cursor-pointer"
          onClick={() => router.back()}
        />
        Add New Product
      </h2>

      <div onSubmit={handleSubmit} className="w-full ">
        <Card className="mb-8">
          <CardContent className="pt-2 w-full">
            <div className="flex w-full justify-between items-center mb-4">
              <h3 className="text-2xl font-bold mb-6">Product Details</h3>
              <div className="flex items-center space-x-2 my-[2rem]">
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="publish">Publish</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* <InputField
                name="productSKU"
                label="Enter Product SKU"
                placeholder="Product SKU"
                value={formData.productSKU}
                onChange={handleChange}
              /> */}
              <InputField
                name="name"
                label="Enter Product name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
              />
              <InputField
                name="description"
                label="Product Description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleChange}
              />
              

              <InputField
                name="packageDetails"
                label="Package Details"
                placeholder="Enter package details"
                type="textarea"
                value={formData.packageDetails}
                onChange={handleChange}
              />
              <InputField
                name="productOutput"
                label="Product Output"
                placeholder="Enter product output"
                type="textarea"
                value={formData.productOutput}
                onChange={handleChange}
              />
              <InputField
                name="deliveryDetails"
                label="Delivery Details"
                placeholder="Enter delivery details"
                type="textarea"
                value={formData.deliveryDetails}
                onChange={handleChange}
              />
              <InputField
                name="deliveryInstruction"
                label="Delivery Instructions"
                placeholder="Enter delivery instructions"
                type="textarea"
                value={formData.deliveryInstruction}
                onChange={handleChange}
              />
              <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    GST Percentage
                  </label>
                  <Input
                    type="number"
                    value={formData.GST.percentage}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        GST: {
                          ...prev.GST,
                          percentage: parseFloat(e.target.value) || 0
                        }
                      }))
                    }
                    placeholder="Enter GST %"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                <label className="text-sm text-gray-600 mb-1 block">
                Category
              </label>
              <Select 
                value={formData.categoryId}
                onValueChange={(value: string) =>
                  handleSelectChange("categoryId", value)
                }
              >
                <SelectTrigger className="w-full p-1" >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                                  <SelectContent className="w-full">
                    {Array.isArray(categories) && categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
                </div>
                <InputField
                name="price"
                label="Product Price"
                placeholder="price"
                value={formData.price}
                onChange={handleChange}
              />
             
            </div>

            <div className="w-full">
              
              <div className="mb-6">
              <h4 className="text-lg font-medium mb-4">Product Discounts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Discount Type
                  </label>
                  <Select
                    value={newDiscount.discountType}
                    onValueChange={(value) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        discountType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full p-1" >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    value={newDiscount.discountValue}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        discountValue: Number(e.target.value),
                      }))
                    }
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newDiscount.startDate}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newDiscount.endDate}
                    onChange={(e) =>
                      setNewDiscount((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              {/* <Button
                type="button"
                onClick={handleAddDiscount}
                disabled={
                  !newDiscount.discountType || newDiscount.discountValue <= 0
                }
              >
                Add Discount
              </Button> */}

              {/* {newVariant.discounts.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-md font-medium mb-2">Added Discounts</h5>
                  <div className="space-y-2">
                    {newVariant.discounts.map((discount, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {discount.discountType}:
                          </span>{" "}
                          {discount.discountValue}
                          {discount.discountType === "percentage" ? "%" : "$"}
                          <span className="ml-2 text-gray-600">
                            {new Date(discount.startDate).toLocaleDateString()}{" "}
                            -{new Date(discount.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDiscount(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-2">
            <h3 className="text-2xl font-bold mb-6">Images</h3>

            {/* Variant Basic Info */}
            {/* <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Product Variant SKU
                  </label>
                  <Input
                    value={newVariant.productVariantSKU}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        productVariantSKU: e.target.value,
                      })
                    }
                    placeholder="e.g., VAR001"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Variant Title
                  </label>
                  <Input
                    value={newVariant.title}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, title: e.target.value })
                    }
                    placeholder="e.g., Black Keyboard"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Variant Description
                  </label>
                  <Input
                    value={newVariant.description}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="e.g., Wireless mechanical keyboard"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Variant Type
                  </label>
                  <Input
                    value={newVariant.variantType}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        variantType: e.target.value,
                      }))
                    }
                    placeholder="e.g., color"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Variant Value
                  </label>
                  <Input
                    value={newVariant.variantValue}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        variantValue: e.target.value,
                      }))
                    }
                    placeholder="e.g., black"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Price
                  </label>
                  <Input
                    type="number"
                    value={newVariant.price}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    value={newVariant.stockQuantity}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        stockQuantity: Number(e.target.value),
                      }))
                    }
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Product Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={newVariant.productWeight}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        productWeight: Number(e.target.value),
                      }))
                    }
                    placeholder="e.g., 15"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Additional Price
                  </label>
                  <Input
                    type="number"
                    value={newVariant.additionalPrice}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        additionalPrice: Number(e.target.value),
                      }))
                    }
                    placeholder="20"
                  />
                </div>
              </div>
            </div> */}

                          {/* Product Images */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">Product Images</h4>
                <FileUpload
                  onFilesUploaded={handleProductImagesUploaded}
                  existingFiles={formData.images.map((img) => img.imageUrl)}
                  onFileRemoved={handleProductImageRemoved}
                />

                {formData.images.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-medium mb-4">
                      Select Primary Image
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                        >
                          <div
                            className={`relative h-24 w-full rounded-lg overflow-hidden border-2 ${
                              img.isPrimary
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                          >
                            <Image
                              src={img.imageUrl}
                              alt={`Product Image ${index + 1}`}
                              fill
                              className="object-cover"
                              onClick={() =>
                                handleProductSetPrimaryImage(img.imageUrl)
                              }
                            />
                            {img.isPrimary && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Primary
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`mt-2 w-full text-center text-sm ${
                              img.isPrimary
                                ? "text-blue-600"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                            onClick={() =>
                              handleProductSetPrimaryImage(img.imageUrl)
                            }
                          >
                            {img.isPrimary ? "Primary Image" : "Set as Primary"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            {/* <div className="mb-6">
              <h4 className="text-lg font-medium mb-4">Product LayoutImages </h4>
              <FileUpload
                onFilesUploaded={handleVariantFilesUploaded}
                existingFiles={newVariant.images.map((img) => img.imageUrl)}
                onFileRemoved={handleVariantFileRemoved}
              />

              {newVariant.images.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-md font-medium mb-4">
                    Select Primary Image
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newVariant.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                      >
                        <div
                          className={`relative h-24 w-full rounded-lg overflow-hidden border-2 ${
                            img.isPrimary
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          <Image
                            src={img.imageUrl}
                            alt={`Variant Image ${index + 1}`}
                            fill
                            className="object-cover"
                            onClick={() =>
                              handleVariantSetPrimaryImage(img.imageUrl)
                            }
                          />
                          {img.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                              Primary
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`mt-2 w-full text-center text-sm ${
                            img.isPrimary
                              ? "text-blue-600"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          onClick={() =>
                            handleVariantSetPrimaryImage(img.imageUrl)
                          }
                        >
                          {img.isPrimary ? "Primary Image" : "Set as Primary"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div> */}
            

            {/* <Button
              type="button"
              onClick={handleAddVariant}
              disabled={!newVariant.variantType || !newVariant.variantValue}
              className="w-full"
            >
              Add Variant
            </Button>

            {formData.variants.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Added Variants</h4>
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{variant.title}</span>
                          <span className="text-gray-600 ml-2">
                            {variant.variantType}: {variant.variantValue}
                          </span>
                          <span className="text-green-600 ml-2">
                            ${variant.price}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>

                      {variant.images.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {variant.images.slice(0, 3).map((img, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative h-12 w-12 rounded overflow-hidden"
                            >
                              <Image
                                src={img.imageUrl}
                                alt={`Variant ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                              {img.isPrimary && (
                                <div className="absolute inset-0 border-2 border-blue-500"></div>
                              )}
                            </div>
                          ))}
                          {variant.images.length > 3 && (
                            <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-xs">
                              +{variant.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {variant.discounts.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Discounts: {variant.discounts.length} applied
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">About Product</h3>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-mode"
                  checked={isEditMode}
                  onCheckedChange={setIsEditMode}
                />
                <label
                  htmlFor="edit-mode"
                  className="text-sm text-gray-600 select-none cursor-pointer"
                >
                  {isEditMode ? "Edit Mode" : "View Mode"}
                </label>
              </div>
            </div>
            <div className="mb-6">
              <RichTextEditorSection 
                content={content}
                setContent={setContent}
                isEditMode={isEditMode}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6 flex-col">
          <Button
            onClick={handleSubmit}
            className="bg-yellow-600 hover:bg-yellow-700 flex-1 text-white  font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
