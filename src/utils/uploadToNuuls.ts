export const uploadToNuuls = async (file: File): Promise<string> => {
    const API = "https://i.nuuls.com/v1/uploads?api_key=821862d49abcbff1231627afafb01985";

    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(API, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        throw new Error("Upload ảnh thất bại");
    }
    return await res.text();
}