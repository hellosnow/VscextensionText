// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

const minHorizontalSpacing = 6;

function buildTree(containerName, treeData) {
    var i = 0;
    var duration = 750;
    var root;
    var maxLabelLengthOfEachLevel = [0];
    var port = document.body.childNodes[1].data;

    // Size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth])
        .separation(function (a, b) {
            return a.parent = b.parent ? 1 : 2;
        });

    // Define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    // Call visit function to establish maxLabelLength
    visit(treeData, 0, function (d, level) {
        var tmp = level;
        // If the node has children , the text(node's name) will be displayed on the left of node , or on the right
        if (!(d.children && d.children.length > 0))
            tmp++;
        // 'while' but not 'if' because it maybe skip the next level 
        while (maxLabelLengthOfEachLevel.length <= tmp)
            maxLabelLengthOfEachLevel.push(minHorizontalSpacing);
        maxLabelLengthOfEachLevel[tmp] = Math.min(Math.max(maxLabelLengthOfEachLevel[tmp], GetTokenName(d.name).length), 12);
    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    })

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // Define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // Define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    var currrentCenterNode = root;
    var targetNode = root;

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = viewerWidth / 4;

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);

    // If selection range intersect with token range
    function isIntersect(tokenStart, tokenEnd, selectionSatrt, selectionEnd) {
        return Math.max(tokenStart, selectionSatrt) <= Math.min(tokenEnd, selectionEnd);
    }

    // Communication with extension to get the selection startLineNumber and endLinerNumber
    setInterval(function () {
        $.get("http://localhost:" + port.toString())
            .done(function (data) {
                // Hightlight the circle of chosen node
                var linenumber = data.split(" ");
                svgGroup.selectAll("g.node")
                    .select("circle.nodeCircle")
                    .style("fill", function (d) {
                        if (isIntersect(parseInt(GetStartLineNumber(d.name)), parseInt(GetEndLineNumber(d.name)), parseInt(linenumber[0]), parseInt(linenumber[1]))) {    //centerNode(d);
                            targetNode = d;
                            return "#EDE68A";
                        } else {
                            return d._children ? "lightsteelblue" : "#fff";
                        }
                    });

                // Hight the text of chosen node
                svgGroup.selectAll("g.node")
                    .select("text")
                    .style("fill", function (d) {
                        if (isIntersect(parseInt(GetStartLineNumber(d.name)), parseInt(GetEndLineNumber(d.name)), parseInt(linenumber[0]), parseInt(linenumber[1]))) {    //centerNode(d);
                            targetNode = d;
                            return "#EDE68A";
                        } else {
                            return "#d4d4d4";
                        }
                    });
            })
        if (targetNode !== currrentCenterNode) {
            centerNode(targetNode);
            currrentCenterNode = targetNode;
        }
    }, 200);

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function (level, n) {
            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function (d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 40; // 40 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Compute the offet of node on the node.depth and maxLabelLengthOfeachLevel
        function getoffset(level) {
            var count = 0;
            for (var i = 1; i <= level; i++) {
                count += maxLabelLengthOfEachLevel[i] * (22 - i * 2);
            }
            return count;
        }

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function (d) {
            d.y = getoffset(d.depth);
        });

        // Update the nodes
        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            });

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function (d) {
                return d._children ? "steelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                return GetTokenName(d.name);
            });

        nodeEnter.append("title")
            .text(function (d) {
                return GetAltContent(d.name);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("y", function (d) {
                if (d.depth === 0)
                    return 0;
                else
                    return d.children || d._children ? -15 : 0;
            })
            .attr("text-anchor", function (d) {
                if (d.depth === 0)
                    return "end";
                else
                    return d.children || d._children ? "middle" : "start";
            })
            .text(function (d) {
                return GetTokenName(d.name);
            })
            .attr("font-size", function (d) {
                return (20 - d.depth * 4) < 11 ? 11 : (25 - d.depth * 4);
            })
            .on('click', textClick);

        node.select('title')
            .text(function (d) {
                return GetAltContent(d.name);
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                return d._children ? "steelblue" : "#fff";
            })
            .on('click', circleClick);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links
        var link = svgGroup.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Function to center node when clicked so node will be tranlated to the center(depend on the depth)
    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 3 + source.depth * 100;   // Center of different level will be different
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children on click.
    function circleClick(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        update(d);
        centerNode(d);
    }

    // map to left editor when click the text
    function textClick(d) {
        $.get("http://localhost:" + port.toString() + "/lineNumber/" + GetStartLineNumber(d.name) + "/" + GetEndLineNumber(d.name) + "/");
    }
}

// Get the token type from name
function GetTokenName(name) {
    var info = name.split(">");
    return info[2];
}

// Get linenum from name
function GetStartLineNumber(name) {
    var info = name.split(">");
    return info[0];
}

function GetEndLineNumber(name) {
    var info = name.split(">");
    return info[1];
}

// Get the content from name
function GetAltContent(name) {
    var info = name.split(">");
    return info[3];
}

// A recursive helper function for performing some setup by walking through all nodes
function visit(parent, level, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent, level);

    var children = childrenFn(parent);
    if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
            visit(children[i], level + 1, visitFn, childrenFn);
        }
    }
}