import React, {useEffect, useState} from "react";
import {ProductModal} from "Functions/productInfo";
import "./productList.css";

interface Product {
    productId: string;
    userId: string;
    name: string;
    category: string;
    description: string;
    location: string;
    priceUSD: string;
    condition: string;
    tradePossible: boolean;
    contactDetails: {
        email: string;
        phoneNumber: string;
    };
    images: string[];
    formattedDateTime: string;
}

interface SessionInfo {
    userId: string;
    username: string;
    email: string;
    password: string;
    profilePhoto: string;
    pinnedChats: string[];
    selectedProducts: string[];
}

interface userInfo {
    profilePhoto: string;
    userId: string;
    username: string;
}

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | undefined>(
        undefined
    );
    const [selectedProducts, setSelectedProducts] = useState<string[] | null>(
        null
    );
    const [usersInfo, setUsersInfo] = useState<userInfo[] | null>(null);
    const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
    const imageBaseUrl = "/uploads/";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionRes = await fetch(`/api/session-info`);
                const sessionData = await sessionRes.json();
                const usersRes = await fetch(`/api/users`);
                const usersInfo = await usersRes.json();
                const productRes = await fetch(`/api/New-ads`);
                if (!productRes.ok) throw new Error("Failed to fetch product data");
                const {products} = await productRes.json();

                // Set session info and directly use sessionData to set selected products
                setSessionInfo(sessionData);
                setSelectedProducts(sessionData.selectedProducts); // Now using sessionData directly
                setUsersInfo(usersInfo);

                setProducts(products);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const isFavorite = (productId) => {
        if (selectedProducts) {
            return selectedProducts.includes(productId);
        }
        return false;
    };

    const addRemoveFavorites = async (
        event: React.MouseEvent,
        productId: string
    ) => {
        event.stopPropagation();
        if (!selectedProducts) return;
        if (selectedProducts.includes(productId)) {
            const updatedSelectedData = selectedProducts.filter(
                (product) => product !== productId
            );
            setSelectedProducts(updatedSelectedData);
            const removeReq = await fetch("/api/remove-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: sessionInfo?.userId,
                    productIds: [productId],
                }),
            });
            if (!removeReq.ok) return;
        } else {
            const updatedSelectedData = [...selectedProducts, productId];
            setSelectedProducts(updatedSelectedData);
            const selectReq = await fetch("/api/select-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: sessionInfo?.userId,
                    productIds: [productId],
                }),
            });
            if (!selectReq.ok) return;
        }
    };

    return (
        <>
            {openedProduct && (
                <ProductModal
                    uploadedImgs={true}
                    allUsersData={usersInfo}
                    sessionInfo={sessionInfo}
                    product={openedProduct}
                    onClose={() => setOpenedProduct(null)}
                />
            )}
            <div className="product-list-container">
                <h1>New Ads</h1>
                <div className="product-list">
                    {products.map((product) => (
                        <div
                            onClick={() => setOpenedProduct(product)}
                            key={product.productId}
                            className={`product`}
                        >
                            <img
                                src={`${imageBaseUrl}${product.images?.[0]}`}
                                alt={product.name}
                            />
                            <div className="product-info">
                                <p className="name">{product.name}</p>
                                <ul>
                                    <li className="product-location">{product.location}</li>
                                    <li className="release-date">{product.formattedDateTime}</li>
                                </ul>
                                <p className="price">{product.priceUSD}$</p>
                            </div>

                            <button
                                onClick={(e) => addRemoveFavorites(e, product.productId)}
                                className={
                                    isFavorite(product.productId)
                                        ? "selectedButton Added"
                                        : "selectedButton"
                                }
                            >
                                <svg className="icon icon-envelop" viewBox="0 0 35 32">
                                    <use xlinkHref="symbol-defs.svg#icon-heart"></use>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ProductList;
