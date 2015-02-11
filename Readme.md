
# diffXcodeTargets

Command line tool that can be used to diff two Xcode targets source files, frameworks and build settings.

:warning: :warning: :warning: this is a bit of an early spike :construction: :construction: :construction:

# Sample of a diff

![sample image of a diff of two targets](assets/SampleOfDiff.png)

[diffXcodeTargets](https://github.com/staxmanade/diffXcodeTargets) is a command line utility I threw together that allows you to visualize the differences between two Xcode project targets using a diff tool.

# Install it with [npm](https://npm.org)

    npm install -g diffxcodetargets

# How to use it?

You can first call it by passing in the path to your project file and no targets and it will print out what targets are available.


    > diffXcodeTargets ./myProject.xcodeproj/project.pbxproj

    Could not find TargetA ''. Possible targets are:
      - targetA
      - targetB

Now you know your available targets and you can call it with the two targets you want to diff:

    diffXcodeTargets ./myProject.xcodeproj/project.pbxproj targetA targetB

# CLI Usage

&nbsp;&nbsp;`diffXcodeTargets projectFilePath targetA targetB`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  **[--version]**          : Prints just the version

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  **[--help]**             : Prints this help info

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  **[--debug]**            : Logs extra diagnostic debug info

# Example(s)

`diffXcodeTargets ./myProject.xcodeproj/project.pbxproj targetA targetB`
