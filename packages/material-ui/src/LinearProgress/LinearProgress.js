import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { deepmerge } from '@material-ui/utils';
import { unstable_composeClasses as composeClasses } from '@material-ui/unstyled';
import { keyframes, css } from '@material-ui/styled-engine';
import capitalize from '../utils/capitalize';
import { darken, lighten } from '../styles/colorManipulator';
import useTheme from '../styles/useTheme';
import experimentalStyled from '../styles/experimentalStyled';
import useThemeProps from '../styles/useThemeProps';
import linearProgressClasses, { getLinearProgressUtilityClass } from './linearProgressClasses';

const TRANSITION_DURATION = 4; // seconds
const indeterminate1Keyframe = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`;

const indeterminate2Keyframe = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`;

const bufferKeyframe = keyframes`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`;

const overridesResolver = (props, styles) => {
  const { styleProps } = props;

  return deepmerge(styles.root || {}, {
    ...styles[`color${capitalize(styleProps.color)}`],
    ...styles[styleProps.variant],
    [`& .${linearProgressClasses.dashed}`]: styleProps.variant === 'buffer' && {
      ...styles.dashed,
      ...styles[`dashedColor${capitalize(styleProps.color)}`],
    },
    [`& .${linearProgressClasses.bar}`]: {
      ...styles.bar,
      ...styles[`barColor${capitalize(styleProps.color)}`],
    },
    [`& .${linearProgressClasses.bar1Indeterminate}`]:
      (styleProps.variant === 'indeterminate' || styleProps.variant === 'query') &&
      styles.bar1Indeterminate,
    [`& .${linearProgressClasses.bar1Determinate}`]:
      styleProps.variant === 'determinate' && styles.bar1Determinate,
    [`& .${linearProgressClasses.bar1Buffer}`]:
      styleProps.variant === 'buffer' && styles.bar1Buffer,
    [`& .${linearProgressClasses.bar2Indeterminate}`]:
      (styleProps.variant === 'indeterminate' || styleProps.variant === 'query') &&
      styles.bar2Indeterminate,
    [`& .${linearProgressClasses.bar2Buffer}`]:
      styleProps.variant === 'buffer' && styles.bar2Buffer,
  });
};

const useUtilityClasses = (styleProps) => {
  const { classes, variant, color } = styleProps;

  const slots = {
    root: ['root', `color${capitalize(color)}`, variant],
    dashed: ['dashed', `dashedColor${capitalize(color)}`],
    bar1: [
      'bar',
      `barColor${capitalize(color)}`,
      (variant === 'indeterminate' || variant === 'query') && 'bar1Indeterminate',
      variant === 'determinate' && 'bar1Determinate',
      variant === 'buffer' && 'bar1Buffer',
    ],
    bar2: [
      'bar',
      variant !== 'buffer' && `barColor${capitalize(color)}`,
      variant === 'buffer' && `color${capitalize(color)}`,
      (variant === 'indeterminate' || variant === 'query') && 'bar2Indeterminate',
      variant === 'buffer' && 'bar2Buffer',
    ],
  };

  return composeClasses(slots, getLinearProgressUtilityClass, classes);
};

const getColorShade = (theme, color) =>
  theme.palette.mode === 'light'
    ? lighten(theme.palette[color].main, 0.62)
    : darken(theme.palette[color].main, 0.5);

const LinearProgressRoot = experimentalStyled(
  'span',
  {},
  {
    name: 'MuiLinearProgress',
    slot: 'Root',
    overridesResolver,
  },
)(({ styleProps, theme }) => ({
  /* Styles applied to the root element. */
  position: 'relative',
  overflow: 'hidden',
  display: 'block',
  height: 4,
  zIndex: 0, // Fix Safari's bug during composition of different paint.
  '@media print': {
    colorAdjust: 'exact',
  },
  backgroundColor: getColorShade(theme, styleProps.color),
  /* Styles applied to the root element if `variant="buffer"`. */
  ...(styleProps.variant === 'buffer' && { backgroundColor: 'transparent' }),
  /* Styles applied to the root element if `variant="query"`. */
  ...(styleProps.variant === 'query' && { transform: 'rotate(180deg)' }),
}));

const LinearProgressDashed = experimentalStyled(
  'span',
  {},
  {
    name: 'MuiLinearProgress',
    slot: 'Dashed',
  },
)(
  ({ styleProps, theme }) => {
    const backgroundColor = getColorShade(theme, styleProps.color);

    return {
      /* Styles applied to the additional bar element if `variant="buffer"`. */
      position: 'absolute',
      marginTop: 0,
      height: '100%',
      width: '100%',
      backgroundImage: `radial-gradient(${backgroundColor} 0%, ${backgroundColor} 16%, transparent 42%)`,
      backgroundSize: '10px 10px',
      backgroundPosition: '0 -23px',
    };
  },
  css`
    animation: ${bufferKeyframe} 3s infinite linear;
  `,
);

const LinearProgressBar1 = experimentalStyled(
  'span',
  {},
  {
    name: 'MuiLinearProgress',
    slot: 'Bar1',
  },
)(
  ({ styleProps, theme }) => ({
    /* Styles applied to the additional bar element if `variant="buffer"`. */
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    transition: 'transform 0.2s linear',
    transformOrigin: 'left',
    backgroundColor: theme.palette[styleProps.color].main,
    /* Styles applied to the bar1 element if `variant="determinate"`. */
    ...(styleProps.variant === 'determinate' && {
      transition: `transform .${TRANSITION_DURATION}s linear`,
    }),
    /* Styles applied to the bar1 element if `variant="buffer"`. */
    ...(styleProps.variant === 'buffer' && {
      zIndex: 1,
      transition: `transform .${TRANSITION_DURATION}s linear`,
    }),
  }),
  /* Styles applied to the bar1 element if `variant="indeterminate or query"`. */
  ({ styleProps }) =>
    (styleProps.variant === 'indeterminate' || styleProps.variant === 'query') &&
    css`
      width: auto;
      animation: ${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `,
);

const LinearProgressBar2 = experimentalStyled(
  'span',
  {},
  {
    name: 'MuiLinearProgress',
    slot: 'Bar2',
  },
)(
  ({ styleProps, theme }) => ({
    /* Styles applied to the additional bar element if `variant="buffer"`. */
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    transition: 'transform 0.2s linear',
    transformOrigin: 'left',
    ...(styleProps.variant !== 'buffer' && {
      backgroundColor: theme.palette[styleProps.color].main,
    }),
    /* Styles applied to the bar2 element if `variant="buffer"`. */
    ...(styleProps.variant === 'buffer' && {
      backgroundColor: getColorShade(theme, styleProps.color),
      transition: `transform .${TRANSITION_DURATION}s linear`,
    }),
  }),
  /* Styles applied to the bar1 element if `variant="indeterminate or query"`. */
  ({ styleProps }) =>
    (styleProps.variant === 'indeterminate' || styleProps.variant === 'query') &&
    css`
      width: auto;
      animation: ${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `,
);

/**
 * ## ARIA
 *
 * If the progress bar is describing the loading progress of a particular region of a page,
 * you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
 * attribute to `true` on that region until it has finished loading.
 */
const LinearProgress = React.forwardRef(function LinearProgress(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiLinearProgress' });
  const {
    className,
    color = 'primary',
    value,
    valueBuffer,
    variant = 'indeterminate',
    ...other
  } = props;
  const styleProps = {
    ...props,
    color,
    variant,
  };

  const classes = useUtilityClasses(styleProps);
  const theme = useTheme();

  const rootProps = {};
  const inlineStyles = { bar1: {}, bar2: {} };

  if (variant === 'determinate' || variant === 'buffer') {
    if (value !== undefined) {
      rootProps['aria-valuenow'] = Math.round(value);
      rootProps['aria-valuemin'] = 0;
      rootProps['aria-valuemax'] = 100;
      let transform = value - 100;
      if (theme.direction === 'rtl') {
        transform = -transform;
      }
      inlineStyles.bar1.transform = `translateX(${transform}%)`;
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        'Material-UI: You need to provide a value prop ' +
          'when using the determinate or buffer variant of LinearProgress .',
      );
    }
  }
  if (variant === 'buffer') {
    if (valueBuffer !== undefined) {
      let transform = (valueBuffer || 0) - 100;
      if (theme.direction === 'rtl') {
        transform = -transform;
      }
      inlineStyles.bar2.transform = `translateX(${transform}%)`;
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        'Material-UI: You need to provide a valueBuffer prop ' +
          'when using the buffer variant of LinearProgress.',
      );
    }
  }

  return (
    <LinearProgressRoot
      className={clsx(classes.root, className)}
      styleProps={styleProps}
      role="progressbar"
      {...rootProps}
      ref={ref}
      {...other}
    >
      {variant === 'buffer' ? (
        <LinearProgressDashed className={classes.dashed} styleProps={styleProps} />
      ) : null}
      <LinearProgressBar1
        className={classes.bar1}
        styleProps={styleProps}
        style={inlineStyles.bar1}
      />
      {variant === 'determinate' ? null : (
        <LinearProgressBar2
          className={classes.bar2}
          styleProps={styleProps}
          style={inlineStyles.bar2}
        />
      )}
    </LinearProgressRoot>
  );
});

LinearProgress.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'primary'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['primary', 'secondary']),
    PropTypes.string,
  ]),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.object,
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number,
  /**
   * The value for the buffer variant.
   * Value between 0 and 100.
   */
  valueBuffer: PropTypes.number,
  /**
   * The variant to use.
   * Use indeterminate or query when there is no progress value.
   * @default 'indeterminate'
   */
  variant: PropTypes.oneOf(['buffer', 'determinate', 'indeterminate', 'query']),
};

export default LinearProgress;
