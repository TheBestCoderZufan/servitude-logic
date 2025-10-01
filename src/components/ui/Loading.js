// src/components/ui/Loading.js
"use client";
import styled, { keyframes } from "styled-components";

// Spinner animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

// Basic Spinner Component
const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SpinnerCircle = styled.div`
  width: ${({ size = '24' }) => size}px;
  height: ${({ size = '24' }) => size}px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Spinner = ({ size, text, ...props }) => (
  <SpinnerContainer {...props}>
    <SpinnerCircle size={size} />
    {text && <SpinnerText>{text}</SpinnerText>}
  </SpinnerContainer>
);

// Dots Loading Animation
const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ delay }) => delay || '0s'};
`;

export const DotsLoader = ({ ...props }) => (
  <DotsContainer {...props}>
    <Dot delay="0s" />
    <Dot delay="0.16s" />
    <Dot delay="0.32s" />
  </DotsContainer>
);

// Skeleton Components
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundSecondary} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.radii.md};
`;

export const SkeletonText = styled(SkeletonBase)`
  height: ${({ height = '16px' }) => height};
  width: ${({ width = '100%' }) => width};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${({ size = '40px' }) => size};
  height: ${({ size = '40px' }) => size};
  border-radius: 50%;
  flex-shrink: 0;
`;

export const SkeletonCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SkeletonTable = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

export const SkeletonTableRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

// Complex Skeleton Components
export const ProjectCardSkeleton = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ flex: 1 }}>
        <SkeletonText height="20px" width="70%" />
        <SkeletonText height="14px" width="50%" />
      </div>
      <SkeletonText height="24px" width="60px" />
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <SkeletonText height="14px" width="80px" />
      <SkeletonText height="14px" width="60px" />
      <SkeletonText height="14px" width="40px" />
    </div>
    
    <SkeletonText height="8px" width="100%" style={{ marginBottom: '8px' }} />
    <SkeletonText height="12px" width="30%" />
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '16px', 
      margin: '16px 0',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="16px" width="30px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="12px" width="40px" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="16px" width="30px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="12px" width="40px" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="16px" width="20px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="12px" width="30px" style={{ margin: '0 auto' }} />
      </div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
        <SkeletonCircle size="32px" />
        <SkeletonCircle size="32px" style={{ marginLeft: '-8px' }} />
        <SkeletonCircle size="32px" style={{ marginLeft: '-8px' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonText height="32px" width="32px" />
        <SkeletonText height="32px" width="32px" />
        <SkeletonText height="32px" width="32px" />
      </div>
    </div>
  </SkeletonCard>
);

export const ClientCardSkeleton = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
      <SkeletonCircle size="48px" />
      <div style={{ flex: 1 }}>
        <SkeletonText height="18px" width="60%" />
        <SkeletonText height="14px" width="50%" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <SkeletonCircle size="8px" />
          <SkeletonText height="12px" width="40px" />
        </div>
      </div>
    </div>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '16px', 
      marginBottom: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="18px" width="20px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="10px" width="50px" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="18px" width="20px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="10px" width="40px" style={{ margin: '0 auto' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <SkeletonText height="18px" width="50px" style={{ margin: '0 auto 4px' }} />
        <SkeletonText height="10px" width="50px" style={{ margin: '0 auto' }} />
      </div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
      <SkeletonText height="12px" width="120px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonText height="32px" width="32px" />
        <SkeletonText height="32px" width="32px" />
        <SkeletonText height="32px" width="32px" />
      </div>
    </div>
  </SkeletonCard>
);

export const TaskCardSkeleton = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ flex: 1 }}>
        <SkeletonText height="16px" width="80%" />
        <SkeletonText height="14px" width="100%" style={{ marginTop: '8px' }} />
        <SkeletonText height="14px" width="60%" />
      </div>
      <SkeletonText height="20px" width="50px" />
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <SkeletonCircle size="14px" />
      <SkeletonText height="14px" width="120px" />
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
      <SkeletonText height="20px" width="70px" />
      <SkeletonText height="20px" width="80px" />
      <SkeletonText height="20px" width="60px" />
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SkeletonCircle size="24px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SkeletonCircle size="14px" />
            <SkeletonText height="12px" width="10px" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SkeletonCircle size="14px" />
            <SkeletonText height="12px" width="10px" />
          </div>
          <SkeletonText height="12px" width="40px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonText height="32px" width="32px" />
        <SkeletonText height="32px" width="32px" />
      </div>
    </div>
  </SkeletonCard>
);

export const TableRowSkeleton = () => (
  <SkeletonTableRow>
    <SkeletonCircle size="32px" />
    <SkeletonText width="150px" height="16px" />
    <SkeletonText width="100px" height="16px" />
    <SkeletonText width="80px" height="16px" />
    <SkeletonText width="60px" height="16px" />
    <SkeletonText width="100px" height="16px" />
    <SkeletonText width="80px" height="32px" />
  </SkeletonTableRow>
);

export const DashboardStatsSkeleton = () => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '24px', 
    marginBottom: '32px' 
  }}>
    {[...Array(4)].map((_, i) => (
      <SkeletonCard key={i}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <SkeletonText height="24px" width="60px" style={{ marginBottom: '8px' }} />
            <SkeletonText height="14px" width="80px" style={{ marginBottom: '8px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SkeletonCircle size="16px" />
              <SkeletonText height="14px" width="70px" />
            </div>
          </div>
          <SkeletonCircle size="40px" />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// Full Page Loading Component
const FullPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoadingSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  max-width: 400px;
`;

export const FullPageLoading = ({ title = "Loading...", subtitle = "Please wait while we fetch your data" }) => (
  <FullPageContainer>
    <Spinner size="48" />
    <LoadingTitle>{title}</LoadingTitle>
    <LoadingSubtitle>{subtitle}</LoadingSubtitle>
  </FullPageContainer>
);

// Section Loading Component
const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
`;

export const SectionLoading = ({ title = "Loading", subtitle, size = "32" }) => (
  <SectionContainer>
    <Spinner size={size} />
    {title && (
      <h3 style={{ margin: '16px 0 8px', fontSize: '18px', color: '#1e293b' }}>
        {title}
      </h3>
    )}
    {subtitle && (
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
        {subtitle}
      </p>
    )}
  </SectionContainer>
);

// Button Loading State
export const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Grid Loading Component
export const GridLoading = ({ 
  CardComponent, 
  columns = 'repeat(auto-fill, minmax(350px, 1fr))', 
  count = 6 
}) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: columns, 
    gap: '24px' 
  }}>
    {[...Array(count)].map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);

// Table Loading Component
export const TableLoading = ({ columns = 7, rows = 5 }) => (
  <SkeletonTable>
    {[...Array(rows)].map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </SkeletonTable>
);

// Loading Overlay Component
const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndices.overlay};
  border-radius: inherit;
`;

export const LoadingOverlay = ({ children, text }) => (
  <OverlayContainer>
    <div style={{ textAlign: 'center' }}>
      {children || <Spinner size="32" />}
      {text && (
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
          {text}
        </div>
      )}
    </div>
  </OverlayContainer>
);

// Hook for loading states
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const toggleLoading = () => setIsLoading(prev => !prev);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};