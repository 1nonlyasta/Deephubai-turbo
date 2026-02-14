import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Shield, Cpu } from "lucide-react";

interface Product {
    image: string;
    name: string;
    category: string;
    description: string;
    features: string[];
}

interface ProductDetailProps {
    product: Product | null;
    onClose: () => void;
}

const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
    if (!product) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden"
                    initial={{ scale: 0.8, y: 100, opacity: 0 }}
                    animate={{
                        scale: 1,
                        y: 0,
                        opacity: 1,
                        transition: { type: "spring", damping: 25, stiffness: 300 }
                    }}
                    exit={{ scale: 0.8, y: 100, opacity: 0 }}
                    style={{
                        background: "linear-gradient(145deg, hsl(220 20% 10%) 0%, hsl(220 20% 6%) 100%)",
                        border: "1px solid hsl(220 15% 18%)",
                        boxShadow: "0 0 80px hsl(195 100% 50% / 0.3), 0 25px 80px hsl(0 0% 0% / 0.5)",
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                        <X className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Product Image Section */}
                        <motion.div
                            className="relative p-8 flex items-center justify-center min-h-[300px]"
                            style={{
                                background: "radial-gradient(circle at center, hsl(195 100% 50% / 0.1) 0%, transparent 70%)",
                            }}
                        >
                            <motion.img
                                src={product.image}
                                alt={product.name}
                                className="w-full max-w-xs h-auto object-contain"
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{
                                    scale: 1,
                                    rotate: 0,
                                    transition: { type: "spring", damping: 20, stiffness: 200, delay: 0.1 }
                                }}
                            />

                            {/* Floating glow effect */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                animate={{
                                    background: [
                                        "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.1) 0%, transparent 50%)",
                                        "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.2) 0%, transparent 50%)",
                                        "radial-gradient(circle at 50% 50%, hsl(195 100% 50% / 0.1) 0%, transparent 50%)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>

                        {/* Product Details Section */}
                        <div className="p-8 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-primary font-body text-sm font-medium tracking-wider uppercase">
                                    {product.category}
                                </span>
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 glow-text">
                                    {product.name}
                                </h2>
                            </motion.div>

                            <motion.p
                                className="text-muted-foreground font-body leading-relaxed mt-6 text-base"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {product.description}
                            </motion.p>

                            {/* Features */}
                            <motion.div
                                className="mt-8 space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h4 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
                                    Key Features
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                {index === 0 && <Zap className="w-4 h-4 text-primary" />}
                                                {index === 1 && <Shield className="w-4 h-4 text-primary" />}
                                                {index === 2 && <Cpu className="w-4 h-4 text-primary" />}
                                            </div>
                                            <span className="text-foreground font-body text-sm">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.button
                                className="mt-8 w-full py-4 rounded-xl font-display font-bold text-primary-foreground tracking-wider uppercase transition-all"
                                style={{
                                    background: "linear-gradient(135deg, hsl(195 100% 50%) 0%, hsl(195 80% 40%) 100%)",
                                    boxShadow: "0 0 30px hsl(195 100% 50% / 0.4)",
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{
                                    scale: 1.02,
                                    boxShadow: "0 0 50px hsl(195 100% 50% / 0.6)",
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Learn More
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export { ProductDetail, ProductDetail as Detail };
export default ProductDetail;
