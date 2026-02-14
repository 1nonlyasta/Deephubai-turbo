import { motion } from "framer-motion";

interface Product {
    image: string;
    name: string;
    category: string;
}

interface ProductCardProps {
    product: Product;
    isSelected?: boolean;
    onClick?: () => void;
    index: number;
}

const ProductCard = ({ product, isSelected, onClick, index }: ProductCardProps) => {
    return (
        <motion.div
            className={`relative flex-shrink-0 w-48 h-52 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ${isSelected
                    ? "z-50 scale-110"
                    : "hover:scale-105 hover:z-10"
                }`}
            onClick={onClick}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: 0.4 }}
            whileHover={{
                boxShadow: "0 0 30px hsl(195 100% 50% / 0.4)",
            }}
            style={{
                background: "linear-gradient(145deg, hsl(220 20% 10%) 0%, hsl(220 20% 6%) 100%)",
                border: isSelected ? "2px solid hsl(195 100% 50%)" : "1px solid hsl(220 15% 18%)",
                boxShadow: isSelected
                    ? "0 0 60px hsl(195 100% 50% / 0.6), 0 0 120px hsl(195 100% 50% / 0.3)"
                    : "0 8px 32px hsl(0 0% 0% / 0.4)",
            }}
        >
            {/* Glow overlay when selected */}
            {isSelected && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: "linear-gradient(135deg, hsl(195 100% 50% / 0.2) 0%, hsl(260 80% 60% / 0.1) 100%)",
                    }}
                />
            )}

            {/* Product Image */}
            <div className="relative w-full h-32 p-3 flex items-center justify-center">
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full h-full object-contain transition-transform duration-500 ${isSelected ? "scale-110" : ""
                        }`}
                />
            </div>

            {/* Product Name */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
                <h3
                    className={`font-display text-xs font-bold tracking-wide transition-colors duration-300 truncate ${isSelected ? "text-primary" : "text-foreground"
                        }`}
                >
                    {product.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{product.category}</p>
            </div>
        </motion.div>
    );
};

export default ProductCard;
